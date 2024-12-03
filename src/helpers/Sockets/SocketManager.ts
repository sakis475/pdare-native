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
  private initialized: boolean = false;
  private pendingEventSubscriptions: Map<EventId, Set<EventCallback>> = new Map();

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
        // Handle any pending subscriptions if user is now available
        await this.handlePendingSubscriptions();
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
    this.disconnect();
    // Store current subscriptions as pending
    this.eventListeners.forEach((listeners, eventId) => {
      const callbacks = new Set(Array.from(listeners).map((l) => l.callback));
      this.pendingEventSubscriptions.set(eventId, callbacks);
    });
    this.eventListeners.clear();
  }

  private async handlePendingSubscriptions(): Promise<void> {
    if (!this.user || !this.socket) return;

    // Resubscribe pending listeners
    for (const [eventId, callbacks] of this.pendingEventSubscriptions) {
      for (const callback of callbacks) {
        await this.on(eventId, callback);
      }
    }
    this.pendingEventSubscriptions.clear();
  }

  public async updateUserInstance(): Promise<void> {
    try {
      const user = await getStorage('currentUser');
      if (this.isValidUser(user)) {
        console.log('user is valid');
        this.user = user;
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

    this.socket.removeAllListeners();
    this.attachCoreSocketListeners();

    for (const [eventId, listeners] of this.eventListeners) {
      for (const listener of listeners) {
        const newEventString = this.generateEventString(eventId);
        this.socket.off(listener.eventString);
        this.socket.on(newEventString, listener.callback);
        listener.eventString = newEventString;
      }
    }
  }

  private attachCoreSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to socket server:', this.socket?.id);
      this.initialized = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server.');
      this.initialized = false;
    });

    this.socket.on('connect_error', (err: any) => {
      console.error('Connection error:', err);
      this.initialized = false;
    });
  }

  public connect(url: string, options?: any): void {
    if (!this.user) {
      console.warn('Cannot connect: No user authenticated');
      return;
    }

    if (this.socket?.connected) {
      console.warn('Socket already connected.');
      return;
    }

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }

    this.socket = io(url, {
      ...options,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
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

    this.eventListeners.clear();
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
    this.initialized = false;
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
