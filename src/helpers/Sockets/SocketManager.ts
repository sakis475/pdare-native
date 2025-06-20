import { io, Socket } from 'socket.io-client';
import { getStorage } from '../../storage/store';
import { getBearer, getRequest } from '../requests';
import { EventEmitter, HEALTH_CHECK_RECEIVE } from './EventEmitter';
import { EmitterSubscription } from 'react-native';
import { SessionBearer } from '../../types/requests.types';
import { BASE_DOMAIN } from '../../storage/env';
import { User } from '../../types/basic.types';

type EventCallback = (data: any) => any;

interface EventListener {
  eventString: string;
  callback: EventCallback;
}

class SocketManager {
  private socket: Socket | null = null;
  private user: User | null = null;
  private sessionBearer: SessionBearer | null = null;

  //Prevent Duplicate Listeners
  private eventListeners: Map<EventId, Set<EventListener>> = new Map();

  private static instance: SocketManager | null = null;
  private currentRoom: string | null = null;
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

  private debugLog(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const prefix = `[Socket ${timestamp}]`;
    if (data) {
      console.log(prefix, message, data);
    } else {
      console.log(prefix, message);
    }
  }

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  private async reloadCurrentUser(): Promise<void> {
    try {
      const user = await getStorage('currentUser');
      const sessionBearer = await getBearer({ skipNavigation: true });
      this.user = user;
      this.sessionBearer = sessionBearer;
    } catch (error) {
      console.error('Error reloadCurrentUser:', error);
    }
  }

  private async loadCurrentUser(): Promise<void> {
    try {
      await this.reloadCurrentUser();

      if (this.isValidUser(this.user)) {
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
    return user && user?.restaurant && typeof user?.restaurant?.id === 'number';
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
      const sessionBearer = await getStorage('session_bearer');

      this.sessionBearer = sessionBearer;
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
    if (!this.socket) {
      this.debugLog('⚠️ Cannot attach listeners: Socket not initialized');
      return;
    }

    this.socket
      .on('connect', () => {
        this.debugLog('✅ Socket connected successfully', {
          socketId: this.socket?.id,
          user: this.user?.email,
        });
        this.reconnectionAttempts = 0;
        this.joinRestaurantRoom();
        this.resubscribeAllListeners();
      })
      .on('disconnect', (reason) => {
        this.debugLog('⚠️ Socket disconnected', { reason });
        this.currentRoom = null;
        this.handleReconnection();
      })
      .on('connect_error', (error) => {
        this.debugLog('🚨 Connection error', { error });
        this.handleReconnection();
      })
      .on('ping_timeout', () => {
        this.debugLog('⚠️ Ping timeout occurred');
        this.handleReconnection();
      })
      .on('error', (error) => {
        this.debugLog('? Socket General Error', { error });
      });
  }

  private handleReconnection(force = false): void {
    if (this.isReconnecting && !force) {
      this.debugLog('⚠️ Reconnection already in progress, skipping...');
      return;
    }

    this.debugLog('🔄 Starting reconnection process', {
      attempts: this.reconnectionAttempts,
      maxAttempts: this.maxReconnectionAttempts,
    });
    this.isReconnecting = true;

    const attemptReconnection = async () => {
      if (this.reconnectionAttempts >= this.maxReconnectionAttempts) {
        this.debugLog('❌ Max reconnection attempts reached, reinitializing connection');
        this.reconnectionAttempts = 0;
        this.connect(true);
        return;
      }

      try {
        const backoffDelay = Math.min(
          this.reconnectionDelay * Math.pow(2, this.reconnectionAttempts),
          16000
        );

        this.debugLog(`⏳ Attempting reconnection after ${backoffDelay}ms delay`, {
          attempt: this.reconnectionAttempts + 1,
        });

        await new Promise((resolve) => setTimeout(resolve, backoffDelay));

        this.debugLog('🔌 Creating new socket connection');
        const socket = this.createIoConnection();

        this.debugLog('⏳ Waiting for connection confirmation');
        await new Promise((resolve, reject) => {
          socket.once('connect', () => resolve(socket));
          socket.once('connect_error', reject);
        });

        if (this.socket) {
          this.debugLog('🔄 Closing existing socket connection');
          this.socket.close();
        }

        this.socket = socket;
        this.reconnectionAttempts = 0;
        this.isReconnecting = false;

        this.debugLog('✅ !Reconnection successful', {
          socketId: this.socket?.id,
          user: this.user?.email,
        });

        this.attachCoreSocketListeners();
        this.joinRestaurantRoom();
        await this.resubscribeAllListeners();
      } catch (error) {
        this.reconnectionAttempts++;
        this.debugLog('❌ Reconnection attempt failed', {
          error,
          nextAttempt: this.reconnectionAttempts,
          maxAttempts: this.maxReconnectionAttempts,
        });

        if (!this.periodicReconnectTimer) {
          attemptReconnection();
        }
      }
    };
    attemptReconnection();
  }

  private createIoConnection(): Socket | null {
    return io(BASE_DOMAIN, {
      forceNew: true,
      timeout: 5000,
      reconnection: true,
      reconnectionDelay: this.reconnectionDelay,
      reconnectionDelayMax: 2000,
      reconnectionAttempts: Infinity,
      auth: {
        token: this.sessionBearer?.token,
      },
    });
  }

  public connect(force = false): boolean {
    if (!this.user) {
      console.warn('Cannot connect: No user authenticated');
      return false;
    }

    // Don't attempt connection if we're in the middle of reconnecting
    if (this.isReconnecting && !force) {
      console.warn('Connection attempt blocked - reconnection in progress');
      return false;
    }

    // Clean up existing connection if any
    this.disconnect();

    if (this.reconnectionTimer) {
      clearTimeout(this.reconnectionTimer);
      this.reconnectionTimer = null;
    }

    // Reset reconnection state
    this.reconnectionAttempts = 0;
    this.isReconnecting = false;

    // Create new socket with initial configuration
    this.socket = this.createIoConnection();

    this.attachCoreSocketListeners();
    this.startPeriodicReconnectCheck();

    return true;
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
    if (!eventString) return;
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

    // Register the event with the socket
    this.socket?.on(eventString, async (data: any, ack?: (response: any) => void) => {
      try {
        await callback(data); // Call the provided callback with the event data
        if (ack) {
          ack({ status: 'success' }); // Send acknowledgment back to the emitter
        }
      } catch (error) {
        console.error('Error in event callback:', error);
        if (ack) {
          ack({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
          }); // Send error acknowledgment
        }
      }
    });
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
      await this.performHealthCheck();
    }, this.periodicReconnectInterval);

    console.log(`Periodic health check started - interval: ${this.periodicReconnectInterval}ms`);
  }

  private async performHealthCheck(): Promise<void> {
    if (!this.socket || !this.user) {
      this.debugLog('⚠️ Health check skipped - no socket or user');
      return;
    }

    this.debugLog('🏥 Starting health check');

    return new Promise<void>(async (resolve) => {
      let healthCheckReceived = false;
      let subscription: EmitterSubscription | null = null;

      const cleanup = () => {
        subscription?.remove();
        subscription = null;
      };
      const healthCheckTimeout = setTimeout(() => {
        console.log(this.isReconnecting, 'this.isReconnecting');
        console.log(healthCheckReceived, 'this.healthCheckReceived');
        if (!healthCheckReceived) {
          this.debugLog('⚠️ Health check response NOT received');
          this.handleReconnection(true);
        }
        cleanup();
        resolve();
      }, 5000);

      const handleHealthCheck = () => {
        this.debugLog('✅ Health check response received');
        healthCheckReceived = true;
        clearTimeout(healthCheckTimeout);
        cleanup();
        resolve();
      };

      subscription = EventEmitter.addListener(HEALTH_CHECK_RECEIVE, handleHealthCheck);

      const response = await getRequest('/health-check');

      if (!response) {
        this.debugLog('❌ Health check HTTP request failed');
        clearTimeout(healthCheckTimeout);
        if (!this.isReconnecting) {
          this.handleReconnection();
        }
        cleanup();
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

  public generateEventString(eventId: EventId) {
    if (!this.isValidUser(this.user)) {
      console.warn('User or restaurant ID not available');
      return null;
    }

    if (eventId === EventId.printOrder) {
      return EventId.printOrder;
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
  printersDiscovered = 'printersDiscovered',
  printOrder = 'printOrder',
}

export type EventString<ID extends string | number> = `${EventId}:${ID}`;

export const socketManager = SocketManager.getInstance();
