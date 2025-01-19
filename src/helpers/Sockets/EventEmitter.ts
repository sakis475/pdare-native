// tableEventEmitter.ts
import { NativeEventEmitter, NativeModule, EmitterSubscription } from 'react-native';

// Create a dummy native module since we're using it just for events
const dummyNativeModule: NativeModule = {
  addListener: () => {},
  removeListeners: () => {},
};

class SafeEventEmitter extends NativeEventEmitter {
  private activeListeners: Map<string, Set<EmitterSubscription>> = new Map();

  constructor(nativeModule: NativeModule) {
    super(nativeModule);
  }

  addListener(
    eventType: string,
    listener: (...args: any[]) => any,
    context?: any
  ): EmitterSubscription {
    // Add new listener without removing existing ones
    const subscription = super.addListener(eventType, listener, context);

    // Track the new subscription
    if (!this.activeListeners.has(eventType)) {
      this.activeListeners.set(eventType, new Set());
    }
    this.activeListeners.get(eventType).add(subscription);

    return subscription;
  }

  removeListener(eventType: string, subscription: EmitterSubscription): void {
    const listeners = this.activeListeners.get(eventType);
    if (listeners) {
      listeners.delete(subscription);
      subscription.remove();
    }
  }

  removeAllListeners(eventType?: string): void {
    if (eventType) {
      this.removeAllListenersForEvent(eventType);
    } else {
      this.activeListeners.forEach((listeners, type) => {
        this.removeAllListenersForEvent(type);
      });
      this.activeListeners.clear();
    }
    super.removeAllListeners(eventType);
  }

  private removeAllListenersForEvent(eventType: string): void {
    const listeners = this.activeListeners.get(eventType);
    if (listeners) {
      listeners.forEach((subscription) => subscription.remove());
      listeners.clear();
      this.activeListeners.delete(eventType);
    }
  }

  // Helper method to check if an event has any active listeners
  hasListeners(eventType: string): boolean {
    const listeners = this.activeListeners.get(eventType);
    return listeners ? listeners.size > 0 : false;
  }
}

export const EventEmitter = new SafeEventEmitter(dummyNativeModule);

// Event constants
export const LANGUAGE_CHANGED = 'LANGUAGE_CHANGED';
export const ORDERS_UPDATED = 'ORDERS_UPDATED';
export const ITEMS_UPDATED = 'ITEMS_UPDATED';
export const CATEGORIES_UPDATED = 'CATEGORIES_UPDATED';
export const PROPERTY_PATTERNS_UPDATED = 'PROPERTY_PATTERNS_UPDATED';
export const TABLES_UPDATED = 'TABLES_UPDATED';
export const USERS_UPDATED = 'USERS_UPDATED';
export const HEALTH_CHECK_RECEIVE = 'HEALTH_CHECK_RECEIVE';
export const TEMP_ORDER_UPDATED = 'TEMP_ORDER_UPDATED';
export const PRINTERS_DISCOVERED_UPDATE = 'PRINTERS_DISCOVERED_UPDATE';

// Type for event names (optional but recommended for type safety)
export type EventType =
  | typeof LANGUAGE_CHANGED
  | typeof ORDERS_UPDATED
  | typeof ITEMS_UPDATED
  | typeof CATEGORIES_UPDATED
  | typeof PROPERTY_PATTERNS_UPDATED
  | typeof TABLES_UPDATED
  | typeof USERS_UPDATED
  | typeof HEALTH_CHECK_RECEIVE
  | typeof TEMP_ORDER_UPDATED;
