import { io, Socket } from 'socket.io-client';
import { getStorage } from '../../storage/store';

class SocketManager {
  private socket: Socket | null = null;
  private user: User;
  constructor() {
    this.loadCurrentUser(); // Load subscribed events when the class is instantiated
  }

  private async loadCurrentUser(): Promise<void> {
    this.user = await getStorage('currentUser');
    console.log(this.user, 'this.user');
  }

  // Static method to get the singleton instance
  public async updateUserInstance() {
    const user = await getStorage('currentUser'); // Fetch user data
    this.user = user;
  }

  // Connect to the socket server and re-subscribe to stored events
  public connect(url: string, options?: any): void {
    if (this.socket) {
      console.warn('Socket already connected.');
      return;
    }

    this.socket = io(url, options);

    // Clear any previous connect listeners to prevent duplicates
    this.socket.off('connect');

    this.socket.on('connect', () => {
      console.log('Connected to socket server:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server.');
    });

    this.socket.on('connect_error', (err: any) => {
      // console.error('Connection error:', err);
    });
  }

  // Disconnect the socket connection
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      console.log('Socket connection closed.');
      this.socket = null;
    } else {
      console.warn('No active socket connection to close.');
    }
  }

  // Emit an event to the server
  // public emit(event: string, data: any): void {
  //   if (this.socket) {
  //     this.socket.emit(event, data);
  //   } else {
  //     console.warn('Cannot emit, no active socket connection.');
  //   }
  // }

  // Listen for a specific event with a specified callback and track it
  public async on(event: EventId, callback: (data: any) => void): Promise<void> {
    if (this.socket) {
      this.socket.on(this.generateEventString(event), callback);
    } else {
      console.warn(`Cannot listen, no active socket connection.`);
    }
  }

  // Remove listener for a specific event and stop tracking it
  public async off(event: EventId): Promise<void> {
    if (this.socket) {
      this.socket.off(this.generateEventString(event));
    }
  }

  public generateEventString(eventId: EventId): EventString<number> {
    return `${eventId}:${this.user.restaurant.id}`;
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

// Export a singleton instance to manage the socket connection

export const socketManager = new SocketManager();
