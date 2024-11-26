import { io, Socket } from 'socket.io-client';
import { getStorage } from '../../storage/store';

type EventCallback = (data: any) => void;

interface EventListener {
  eventString: string;
  callback: EventCallback;
}

class SocketManager {
  private socket: Socket | null = null;
  private user: User;
  private eventListeners: Map<EventId, Set<EventListener>> = new Map();
  private static instance: SocketManager | null = null;
  private initialized: boolean = false;

  private constructor() {
    this.loadCurrentUser();
  }

  // Singleton getInstance method
  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  private async loadCurrentUser(): Promise<void> {
    try {
      this.user = await getStorage('currentUser');
      console.log('Current user loaded:', this.user);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  }

  public async updateUserInstance(): Promise<void> {
    try {
      const user = await getStorage('currentUser');
      this.user = user;

      // Resubscribe all existing listeners with new user context
      await this.resubscribeAllListeners();
    } catch (error) {
      console.error('Error updating user instance:', error);
    }
  }

  private async resubscribeAllListeners(): Promise<void> {
    if (!this.socket) return;

    // Remove all existing listeners
    this.socket.removeAllListeners();

    // Reattach core socket listeners
    this.attachCoreSocketListeners();

    // Resubscribe all event listeners with new user context
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
    if (this.socket?.connected) {
      console.warn('Socket already connected.');
      return;
    }

    // Cleanup existing socket if it exists
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }

    // Create new socket connection
    this.socket = io(url, {
      ...options,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
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
    if (!this.socket) {
      console.warn('Cannot add listener, no active socket connection.');
      return;
    }

    const eventString = this.generateEventString(eventId);

    // Initialize Set for this eventId if it doesn't exist
    if (!this.eventListeners.has(eventId)) {
      this.eventListeners.set(eventId, new Set());
    }

    // Check for duplicate callback
    const listeners = this.eventListeners.get(eventId)!;
    for (const listener of listeners) {
      if (listener.callback === callback) {
        console.warn('Duplicate event listener prevented:', eventId);
        return;
      }
    }

    // Add new listener
    const listener: EventListener = { eventString, callback };
    listeners.add(listener);
    this.socket.on(eventString, callback);

    console.log(`Event listener added for ${eventString}`);
  }

  public async off(eventId: EventId, callback?: EventCallback): Promise<void> {
    if (!this.socket) return;

    const listeners = this.eventListeners.get(eventId);
    if (!listeners) return;

    if (callback) {
      // Remove specific callback
      for (const listener of listeners) {
        if (listener.callback === callback) {
          this.socket.off(listener.eventString, listener.callback);
          listeners.delete(listener);
          break;
        }
      }
    } else {
      // Remove all callbacks for this eventId
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
    if (!this.user?.restaurant?.id) {
      throw new Error('User or restaurant ID not available');
    }
    return `${eventId}:${this.user.restaurant.id}`;
  }

  // Method to check if specific event listener exists
  public hasListener(eventId: EventId, callback: EventCallback): boolean {
    const listeners = this.eventListeners.get(eventId);
    if (!listeners) return false;

    for (const listener of listeners) {
      if (listener.callback === callback) return true;
    }
    return false;
  }

  // Method to get count of listeners for an event
  public getListenerCount(eventId: EventId): number {
    return this.eventListeners.get(eventId)?.size || 0;
  }

  // Debug method to log current listeners
  public debugListeners(): void {
    console.log('Current event listeners:');
    this.eventListeners.forEach((listeners, eventId) => {
      console.log(`${eventId}: ${listeners.size} listeners`);
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
