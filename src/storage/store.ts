import { MMKV } from 'react-native-mmkv';
import { AppLanguage } from '../core/localization/strings';
import { SessionBearer } from '../types/requests.types';
import { toast } from '../core/utils';
import { EventEmitter, TEMP_ORDER_UPDATED } from '../helpers/Sockets/EventEmitter';

// Initialize MMKV instance
export const storage = new MMKV();

// Define the types for each storage key
interface StorageTypes {
  app_language: AppLanguage;
  session_bearer: SessionBearer;
  groupedItems: catGroupedItems;
  newOrder: Order;
  items: ItemReq[];
  categories: Category[];
  currentUser: User;
  personelUsers: User[];
  propertyPatterns: PropertyPattern[];
  tables: Table[];
  tableOrders: Table[];
  lastestMainTabIndex: number;
  lastCredentials: LastCredentialsStorage;
  activeInvitations: InvitationRequest[];
}

// Type for storage keys
type StorageKey = keyof StorageTypes;

/**
 * Sets an item in MMKV storage with proper type checking and undefined handling
 * @param key Storage key
 * @param value Value to store
 * @returns void
 */
export function setStorage<K extends StorageKey>(key: K, value: StorageTypes[K] | null): void {
  try {
    // Handle undefined case by treating it as null
    const valueToStore = value === undefined ? null : value;

    if (valueToStore === null) {
      removeItemStorage(key);
      return;
    }

    storage.set(key, JSON.stringify(valueToStore));

    if (key === 'newOrder') {
      EventEmitter.emit(TEMP_ORDER_UPDATED, valueToStore);
    }
  } catch (error) {
    console.error(`Error setting storage for key ${key}:`, error);
    throw error;
  }
}

/**
 * Gets an item from MMKV storage with proper type checking
 * @param key Storage key
 * @returns The stored value or null
 */
export function getStorage<K extends StorageKey>(key: K): StorageTypes[K] | null {
  try {
    const item = storage.getString(key);
    if (!item) {
      return null;
    }
    return JSON.parse(item) as StorageTypes[K];
  } catch (error) {
    console.error(`Error getting storage for key ${key}:`, error);
    return null;
  }
}

/**
 * Removes a single item from storage
 * @param key Storage key
 */
export function removeItemStorage(key: StorageKey): void {
  try {
    storage.delete(key);
  } catch (error) {
    console.error(`Error removing item for key ${key}:`, error);
    throw error;
  }
}

/**
 * Removes all items from storage
 */
export function removeAllStorage(): void {
  try {
    storage.clearAll();
    toast('success', 'Removed all keys');
  } catch (error) {
    console.error('Error removing all storage:', error);
    throw error;
  }
}

/**
 * Gets all keys from storage
 * @returns Array of storage keys
 */
export function getAllKeys(): string[] {
  return storage.getAllKeys();
}

/**
 * Clears all restaurant-related storage keys
 */
export function clearRestaurantStorageRelatedKeys(): void {
  const keysToRemove: StorageKey[] = [
    'groupedItems',
    'newOrder',
    'items',
    'categories',
    'currentUser',
    'personelUsers',
    'propertyPatterns',
    'tables',
    'tableOrders',
    'activeInvitations',
  ];

  try {
    keysToRemove.forEach((key) => removeItemStorage(key));
  } catch (error) {
    console.error('Error clearing restaurant storage:', error);
    throw error;
  }
}
