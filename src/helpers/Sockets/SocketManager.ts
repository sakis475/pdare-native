import { io, Socket } from 'socket.io-client';
import { getStorage } from '../../storage/store';

type EventCallback = (data: any) => void;

interface EventListener {
  eventString: string;
  callback: EventCallback;
}

class SocketManager {
  private socket: Socket | null = null;
  private user: User | null = null;
  private eventListeners: Map<EventId, Set<EventListener>> = new Map();
  private static instance: SocketManager | null = null;
  private pendingEventSubscriptions: Map<EventId, Set<EventCallback>> = new Map();
  private currentRoom: string | null = null;
  private lastConnectedUrl: string | null = null;
  private lastConnectedOptions: any = null;
  private reconnectionTimer: NodeJS.Timeout | null = null;
  private periodicReconnectTimer: NodeJS.Timeout | null = null;
  private periodicReconnectInterval: number = 5 * 60 * 1000; // 5 minutes in milliseconds

  private reconnectionAttempts: number = 0;
  private maxReconnectionAttempts: number = 10; // Increased max attempts
  private reconnectionDelay: number = 1000;

  private isReconnecting: boolean = false;

  private constructor() {
    this.loadCurrentUser();
  }

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  private async loadCurrentUser(): Promise<void> {
    try {
      const user = await getStorage('currentUser');
      if (this.isValidUser(user)) {
        this.user = user;
        console.log('Current user loaded:', this.user);
        await this.handlePendingSubscriptions();
        // Join restaurant room if connected
        if (this.socket?.connected) {
          this.joinRestaurantRoom();
        }
      } else {
        this.user = null;
        this.handleNoUser();
      }
    } catch (error) {
      console.error('Error loading current user:', error);
      this.user = null;
      this.handleNoUser();
    }
  }

  private isValidUser(user: any): user is User {
    return user && user.restaurant && typeof user.restaurant.id === 'number';
  }

  private handleNoUser(): void {
    console.warn('No valid user found. Socket functionality is disabled.');
    this.leaveRestaurantRoom();
    this.disconnect();
    this.eventListeners.forEach((listeners, eventId) => {
      const callbacks = new Set(Array.from(listeners).map((l) => l.callback));
      this.pendingEventSubscriptions.set(eventId, callbacks);
    });
    this.eventListeners.clear();
  }

  private startPeriodicReconnectCheck(): void {
    if (this.periodicReconnectTimer) {
      clearInterval(this.periodicReconnectTimer);
    }

    this.periodicReconnectTimer = setInterval(async () => {
      if (!this.user?.restaurant?.id || this.isReconnecting) {
        console.log('Skipping health check - no user/restaurant or reconnection in progress');
        return;
      }

      const isConnected = this.socket?.connected;
      console.log('Periodic check - Socket status:', isConnected ? 'connected' : 'disconnected');

      if (!isConnected) {
        console.log('Socket disconnected, triggering reconnection...');
        this.handleReconnection();
      } else {
        await this.performHealthCheck();
      }
    }, this.periodicReconnectInterval);

    console.log(`Periodic health check started - interval: ${this.periodicReconnectInterval}ms`);
  }

  private async performHealthCheck(): Promise<void> {
    if (!this.socket || !this.user) return;

    return new Promise<void>((resolve) => {
      let healthCheckReceived = false;
      const healthCheckTimeout = setTimeout(() => {
        if (!healthCheckReceived && !this.isReconnecting) {
          console.log('Health check timeout - triggering reconnection');
          this.handleReconnection();
        }
        resolve();
      }, 5000);

      const healthCheckEvent = `${EventId.healthCheck}:${this.user.restaurant.id}`;
      this.socket.once(healthCheckEvent, (response) => {
        if (response.restaurantId === this.user.restaurant.id) {
          healthCheckReceived = true;
          clearTimeout(healthCheckTimeout);
          console.log('Health check successful');
          resolve();
        }
      });

      try {
        this.socket.emit('requestHealthCheck', {
          restaurantId: this.user.restaurant.id,
        });
      } catch (error) {
        console.error('Error sending health check:', error);
        clearTimeout(healthCheckTimeout);
        if (!this.isReconnecting) {
          this.handleReconnection();
        }
        resolve();
      }
    });
  }

  private stopPeriodicReconnectCheck(): void {
    if (this.periodicReconnectTimer) {
      clearInterval(this.periodicReconnectTimer);
      this.periodicReconnectTimer = null;
    }
  }

  private async handlePendingSubscriptions(): Promise<void> {
    if (!this.user || !this.socket) return;

    for (const [eventId, callbacks] of this.pendingEventSubscriptions) {
      for (const callback of callbacks) {
        await this.on(eventId, callback);
      }
    }
    this.pendingEventSubscriptions.clear();
  }

  private joinRestaurantRoom(): void {
    if (!this.user || !this.socket) return;

    const roomName = `restaurant:${this.user.restaurant.id}`;
    if (this.currentRoom !== roomName) {
      if (this.currentRoom) {
        this.socket.emit('leaveRestaurant', this.currentRoom.split(':')[1]);
      }
      this.socket.emit('joinRestaurant', this.user.restaurant.id);
      this.currentRoom = roomName;
      console.log(`Joined room: ${roomName}`);
    }
  }

  private leaveRestaurantRoom(): void {
    if (this.currentRoom && this.socket) {
      this.socket.emit('leaveRestaurant', this.currentRoom.split(':')[1]);
      this.currentRoom = null;
      console.log('Left restaurant room');
    }
  }

  public async updateUserInstance(): Promise<void> {
    try {
      const user = await getStorage('currentUser');
      if (this.isValidUser(user)) {
        const needsRoomUpdate = !this.user || this.user.restaurant.id !== user.restaurant.id;
        this.user = user;

        if (needsRoomUpdate) {
          this.joinRestaurantRoom();
        }

        await this.resubscribeAllListeners();
      } else {
        this.user = null;
        this.handleNoUser();
      }
    } catch (error) {
      console.error('Error updating user instance:', error);
      this.user = null;
      this.handleNoUser();
    }
  }

  private async resubscribeAllListeners(): Promise<void> {
    if (!this.socket || !this.user) return;

    const currentListeners = new Map(this.eventListeners);
    this.eventListeners.clear();
    this.socket.removeAllListeners();
    this.attachCoreSocketListeners();

    for (const [eventId, listeners] of currentListeners) {
      for (const listener of listeners) {
        await this.on(eventId, listener.callback);
      }
    }
  }

  private attachCoreSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to socket server:', this.socket?.id);
      this.reconnectionAttempts = 0;
      this.joinRestaurantRoom();
      this.resubscribeAllListeners();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from socket server:', reason);
      this.currentRoom = null;

      // Handle all disconnect cases
      this.handleReconnection();
    });

    this.socket.on('connect_error', (err: any) => {
      console.error('Connection error:', err);
      this.handleReconnection();
    });

    // Add ping timeout handler
    this.socket.on('ping_timeout', () => {
      console.log('Ping timeout - attempting reconnection');
      this.handleReconnection();
    });

    // Add error handler
    this.socket.on('error', (error: Error) => {
      console.error('Socket error:', error);
      this.handleReconnection();
    });

    // Add pong listener to monitor server response
    // this.socket.on('pong', () => {
    //   console.log('Received pong from server - connection alive');
    // });
  }

  private handleReconnection(): void {
    if (this.isReconnecting) {
      console.log('Reconnection already in progress, skipping');
      return;
    }

    console.log('handleReconnection called');
    this.isReconnecting = true;

    // Close existing socket if any
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.reconnectionTimer) {
      clearTimeout(this.reconnectionTimer);
      this.reconnectionTimer = null;
    }

    const attemptReconnection = () => {
      if (this.reconnectionAttempts < this.maxReconnectionAttempts) {
        const backoffDelay = Math.min(
          this.reconnectionDelay * Math.pow(2, this.reconnectionAttempts),
          16000
        );
        this.reconnectionAttempts++;

        console.log(
          `Scheduling reconnection attempt ${this.reconnectionAttempts}/${this.maxReconnectionAttempts} in ${backoffDelay}ms`
        );

        this.reconnectionTimer = setTimeout(() => {
          console.log('Executing reconnection attempt...');

          if (this.lastConnectedUrl) {
            const socket = io(this.lastConnectedUrl, {
              ...this.lastConnectedOptions,
              forceNew: true,
              timeout: 5000,
              reconnection: false, // Disable socket.io's built-in reconnection
            });

            socket.once('connect', () => {
              console.log('Connection successful');
              if (this.socket) {
                this.socket.close();
              }
              this.socket = socket;
              this.reconnectionAttempts = 0;
              this.isReconnecting = false;
              this.attachCoreSocketListeners();
              this.joinRestaurantRoom();
              this.resubscribeAllListeners();
            });

            socket.once('connect_error', () => {
              socket.close();
              console.log('Connection attempt failed, scheduling next attempt');
              attemptReconnection();
            });
          }
        }, backoffDelay);
      } else {
        console.log('Max reconnection attempts reached. Reinitializing connection...');
        this.reconnectionAttempts = 0;
        this.isReconnecting = false;
        this.reinitializeConnection();
      }
    };

    attemptReconnection();
  }

  private reinitializeConnection(): void {
    // Clean up existing connection
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.close();
      this.socket = null;
    }

    // Attempt to establish a fresh connection
    setTimeout(() => {
      if (this.user) {
        console.log('Reinitializing socket connection...');
        this.connect(this.lastConnectedUrl || '', this.lastConnectedOptions);
      }
    }, 5000); // Wait 5 seconds before attempting reinitialization
  }

  public connect(url: string, options?: any): void {
    if (!this.user) {
      console.warn('Cannot connect: No user authenticated');
      return;
    }

    this.lastConnectedUrl = url;
    this.lastConnectedOptions = options;

    // Don't attempt connection if we're in the middle of reconnecting
    if (this.isReconnecting) {
      console.warn('Connection attempt blocked - reconnection in progress');
      return;
    }

    // Clean up existing connection if any
    if (this.socket) {
      this.leaveRestaurantRoom();
      this.socket.removeAllListeners();
      this.socket.close();
      this.socket = null;
    }

    if (this.reconnectionTimer) {
      clearTimeout(this.reconnectionTimer);
      this.reconnectionTimer = null;
    }

    // Reset reconnection state
    this.reconnectionAttempts = 0;
    this.isReconnecting = false;

    // Create new socket with initial configuration
    this.socket = io(url, {
      ...options,
      reconnection: true,
      reconnectionDelay: this.reconnectionDelay,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectionAttempts,
      timeout: 60000,
      forceNew: true,
      auth: {
        userId: this.user.id,
        restaurantId: this.user.restaurant.id,
      },
    });

    this.attachCoreSocketListeners();
    this.startPeriodicReconnectCheck();
  }

  public disconnect(): void {
    if (!this.socket) {
      console.warn('No active socket connection to close.');
      return;
    }

    this.leaveRestaurantRoom();
    this.eventListeners.clear();
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
    this.currentRoom = null;
    this.stopPeriodicReconnectCheck();
    console.log('Socket connection closed and listeners cleared.');
  }

  public setReconnectInterval(minutes: number): void {
    this.periodicReconnectInterval = minutes * 60 * 1000;
    // Restart the periodic check with new interval if it's running
    if (this.socket?.connected) {
      this.startPeriodicReconnectCheck();
    }
  }

  public async on(eventId: EventId, callback: EventCallback): Promise<void> {
    if (!this.user) {
      console.warn('Cannot add listener: No user authenticated');
      // Store as pending subscription
      if (!this.pendingEventSubscriptions.has(eventId)) {
        this.pendingEventSubscriptions.set(eventId, new Set());
      }
      this.pendingEventSubscriptions.get(eventId)!.add(callback);
      return;
    }

    if (!this.socket) {
      console.warn('Cannot add listener: No active socket connection');
      return;
    }

    const eventString = this.generateEventString(eventId);

    if (!this.eventListeners.has(eventId)) {
      this.eventListeners.set(eventId, new Set());
    }

    const listeners = this.eventListeners.get(eventId)!;
    for (const listener of listeners) {
      if (listener.callback === callback) {
        console.warn('Duplicate event listener prevented:', eventId);
        return;
      }
    }

    const listener: EventListener = { eventString, callback };
    listeners.add(listener);
    this.socket.on(eventString, callback);

    console.log(`Event listener added for ${eventString}`);
  }

  public async off(eventId: EventId, callback?: EventCallback): Promise<void> {
    if (!this.socket) return;

    // Remove from pending subscriptions if exists
    if (this.pendingEventSubscriptions.has(eventId)) {
      const pendingCallbacks = this.pendingEventSubscriptions.get(eventId)!;
      if (callback) {
        pendingCallbacks.delete(callback);
      } else {
        pendingCallbacks.clear();
      }
      if (pendingCallbacks.size === 0) {
        this.pendingEventSubscriptions.delete(eventId);
      }
    }

    const listeners = this.eventListeners.get(eventId);
    if (!listeners) return;

    if (callback) {
      for (const listener of listeners) {
        if (listener.callback === callback) {
          this.socket.off(listener.eventString, listener.callback);
          listeners.delete(listener);
          break;
        }
      }
    } else {
      for (const listener of listeners) {
        this.socket.off(listener.eventString, listener.callback);
      }
      listeners.clear();
    }

    if (listeners.size === 0) {
      this.eventListeners.delete(eventId);
    }
  }

  public generateEventString(eventId: EventId): EventString<number> {
    if (!this.isValidUser(this.user)) {
      throw new Error('User or restaurant ID not available');
    }
    return `${eventId}:${this.user.restaurant.id}`;
  }

  public isAuthenticated(): boolean {
    return this.isValidUser(this.user);
  }

  public getUser(): User | null {
    return this.user;
  }

  public debugListeners(): void {
    console.log('Current event listeners:', {
      active: Array.from(this.eventListeners.entries()).map(([eventId, listeners]) => ({
        eventId,
        count: listeners.size,
      })),
      pending: Array.from(this.pendingEventSubscriptions.entries()).map(([eventId, callbacks]) => ({
        eventId,
        count: callbacks.size,
      })),
    });
  }
}

export enum EventId {
  tableOrdersUpdated = 'tableOrdersUpdated',
  itemsUpdated = 'itemsUpdated',
  categoriesUpdated = 'categoriesUpdated',
  itemPropertyPatternsUpdated = 'itemPropertyPatternsUpdated',
  tablesUpdated = 'tablesUpdated',
  usersUpdated = 'usersUpdated',
  healthCheck = 'healthCheck',
}

export type EventString<ID extends string | number> = `${EventId}:${ID}`;

export const socketManager = SocketManager.getInstance();
