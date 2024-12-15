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

  private reconnectionAttempts: number = 0;
  private maxReconnectionAttempts: number = 10; // Increased max attempts
  private reconnectionDelay: number = 1000;

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
  }

  private handleReconnection(): void {
    if (!this.socket) return;

    const attemptReconnection = () => {
      if (this.reconnectionAttempts < this.maxReconnectionAttempts) {
        this.reconnectionAttempts++;
        console.log(
          `Attempting reconnection ${this.reconnectionAttempts}/${this.maxReconnectionAttempts}`
        );

        // Force a new connection attempt
        this.socket?.close();
        setTimeout(() => {
          if (!this.socket?.connected) {
            this.socket?.connect();
          }
        }, this.reconnectionDelay * Math.min(this.reconnectionAttempts, 5));
      } else {
        console.log('Max reconnection attempts reached. Reinitializing connection...');
        this.reconnectionAttempts = 0;
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

    // Store connection details for reconnection
    this.lastConnectedUrl = url;
    this.lastConnectedOptions = options;

    if (this.socket?.connected) {
      console.warn('Socket already connected.');
      return;
    }

    if (this.socket) {
      this.leaveRestaurantRoom();
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }

    // Clear any existing reconnection timer
    if (this.reconnectionTimer) {
      clearTimeout(this.reconnectionTimer);
      this.reconnectionTimer = null;
    }

    this.socket = io(url, {
      ...options,
      reconnection: true,
      reconnectionDelay: this.reconnectionDelay,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectionAttempts,
      timeout: 60000,
      forceNew: true, // Force a new connection
      auth: {
        userId: this.user.id,
        restaurantId: this.user.restaurant.id,
      },
    });

    this.attachCoreSocketListeners();
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
    console.log('Socket connection closed and listeners cleared.');
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
}

export type EventString<ID extends string | number> = `${EventId}:${ID}`;

// Export singleton instance
export const socketManager = SocketManager.getInstance();
