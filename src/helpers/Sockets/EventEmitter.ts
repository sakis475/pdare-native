// tableEventEmitter.ts
import { NativeEventEmitter, NativeModule } from 'react-native';

// Create a dummy native module since we're using it just for events
const dummyNativeModule: NativeModule = {
  addListener: () => {},
  removeListeners: () => {},
};

export const EventEmitter = new NativeEventEmitter(dummyNativeModule);
export const ORDERS_UPDATED = 'ORDERS_UPDATED';
export const ITEMS_UPDATED = 'ITEMS_UPDATED';
export const CATEGORIES_UPDATED = 'CATEGORIES_UPDATED';
export const PROPERTY_PATTERNS_UPDATED = 'PROPERTY_PATTERNS_UPDATED';
export const TABLES_UPDATED = 'TABLES_UPDATED';
export const USERS_UPDATED = 'USERS_UPDATED';
