import { io, Socket } from 'socket.io-client';
import { getStorage } from '../../storage/store';
import { getBearer, getRequest } from '../requests';
import { EventEmitter, HEALTH_CHECK_RECEIVE } from './EventEmitter';
import { EmitterSubscription } from 'react-native';
import { SessionBearer } from '../../types/requests.types';

type EventCallback = (data: any) => void;

interface EventListener {
  eventString: string;
  callback: EventCallback;
}

class SocketManager {
  private socket: Socket | null = null;
  private user: User | null = null;
  private sessionBearer: SessionBearer | null = null;
  private eventListeners: Map<EventId, Set<EventListener>> = new Map();
  private static instance: SocketManager | null = null;
  private currentRoom: string | null = null;
  private lastConnectedUrl: string | null = null;
  private lastConnectedOptions: any = null;
  private reconnectionTimer: NodeJS.Timeout | null = null;
  private periodicReconnectTimer: NodeJS.Timeout | null = null;
  private periodicReconnectInterval: number = 1 * 25 * 1000;

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
      const sessionBearer = await getBearer();

      if (!sessionBearer) return;

      this.sessionBearer = sessionBearer;

      if (this.isValidUser(user)) {
        this.user = user;
        console.log('Current user loaded:', this.user);
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

    const handleError = (error: any) => {
      console.error('Socket error:', error);
      this.handleReconnection();
    };

    this.socket
      .on('connect', () => {
        console.log('Connected to socket server:', this.socket?.id);
        this.reconnectionAttempts = 0;
        this.joinRestaurantRoom();
        this.resubscribeAllListeners();
      })
      .on('disconnect', (reason) => {
        console.log('Disconnected from socket server:', reason);
        this.currentRoom = null;
        this.handleReconnection();
      })
      .on('connect_error', handleError)
      .on('ping_timeout', () => handleError('Ping timeout'))
      .on('error', handleError);
  }

  private handleReconnection(): void {
    if (this.isReconnecting) return;
    this.isReconnecting = true;

    const attemptReconnection = async () => {
      if (this.reconnectionAttempts >= this.maxReconnectionAttempts) {
        this.reconnectionAttempts = 0;
        this.isReconnecting = false;
        return this.reinitializeConnection();
      }

      try {
        if (!this.lastConnectedUrl) return;

        const backoffDelay = Math.min(
          this.reconnectionDelay * Math.pow(2, this.reconnectionAttempts),
          16000
        );

        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        const socket = io(this.lastConnectedUrl, {
          ...this.lastConnectedOptions,
          forceNew: true,
          timeout: 5000,
          reconnection: false,
          auth: {
            token: this.sessionBearer.token,
          },
        });

        await new Promise((resolve, reject) => {
          socket.once('connect', () => resolve(socket));
          socket.once('connect_error', reject);
        });

        if (this.socket) this.socket.close();
        this.socket = socket;
        this.reconnectionAttempts = 0;
        this.isReconnecting = false;

        this.attachCoreSocketListeners();
        this.joinRestaurantRoom();
        await this.resubscribeAllListeners();
      } catch (error) {
        this.reconnectionAttempts++;
        attemptReconnection();
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
        token: this.sessionBearer.token,
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

  public async on(eventId: EventId, callback: EventCallback): Promise<void> {
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

  private startPeriodicReconnectCheck(): void {
    if (this.periodicReconnectTimer) {
      clearInterval(this.periodicReconnectTimer);
    }

    this.periodicReconnectTimer = setInterval(async () => {
      const isConnected = this.socket?.connected;

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
      let subscription: EmitterSubscription | null = null;

      const cleanup = () => {
        subscription?.remove();
        subscription = null;
      };

      const healthCheckTimeout = setTimeout(() => {
        if (!healthCheckReceived && !this.isReconnecting) {
          console.log('Health check timeout - triggering reconnection');
          this.handleReconnection();
        }
        cleanup();
        resolve();
      }, 5000);

      const handleHealthCheck = () => {
        healthCheckReceived = true;
        clearTimeout(healthCheckTimeout);
        cleanup();
        resolve();
      };

      subscription = EventEmitter.addListener(HEALTH_CHECK_RECEIVE, handleHealthCheck);

      getRequest('/health-check').catch((error) => {
        console.error('Health check HTTP request failed:', error);
        console.log(error, 'error');
        clearTimeout(healthCheckTimeout);
        if (!this.isReconnecting) {
          this.handleReconnection();
        }
        cleanup();
        resolve();
      });
    });
  }

  private stopPeriodicReconnectCheck(): void {
    if (this.periodicReconnectTimer) {
      clearInterval(this.periodicReconnectTimer);
      this.periodicReconnectTimer = null;
    }
  }

  public generateEventString(eventId: EventId): EventString<number> {
    if (!this.isValidUser(this.user)) {
      console.warn('User or restaurant ID not available');
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
