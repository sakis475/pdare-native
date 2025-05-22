import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppLanguage } from '../core/localization/strings';
import { SessionBearer } from '../types/requests.types';
import { toast } from '../core/utils';
import { EventEmitter, TEMP_ORDER_UPDATED } from '../helpers/Sockets/EventEmitter';
import GlobalStore from './GlobalStore';
import {
  Category,
  catGroupedItems,
  InvitationRequest,
  ItemReq,
  LastCredentialsStorage,
  Order,
  PropertyPattern,
  Table,
  User,
} from '../types/basic.types';

const globalStore = GlobalStore.getInstance();

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
 * Sets an item in AsyncStorage with proper type checking and undefined handling
 * @param key Storage key
 * @param value Value to store
 * @returns Promise<void>
 */
export async function setStorage<K extends StorageKey>(
  key: K,
  value: StorageTypes[K] | null
): Promise<void> {
  try {
    // Handle undefined case by treating it as null
    const valueToStore = value === undefined ? null : value;

    if (valueToStore === null) {
      await removeItemStorage(key);
      return;
    }
    const valueStringified = JSON.stringify(valueToStore);
    await AsyncStorage.setItem(key, valueStringified);

    globalStore.setValue(key, valueStringified);

    if (key === 'newOrder') {
      EventEmitter.emit(TEMP_ORDER_UPDATED, valueToStore);
    }
  } catch (error) {
    console.error(`Error setting storage for key ${key}:`, error);
    throw error; // Propagate error for better error handling
  }
}

/**
 * Gets an item from AsyncStorage with proper type checking
 * @param key Storage key
 * @returns Promise with the stored value or null
 */
export async function getStorage<K extends StorageKey>(key: K): Promise<StorageTypes[K] | null> {
  try {
    if (globalStore.hasValue(key)) {
      const value = globalStore.getValue(key);

      const valueParsed = JSON.parse(value) as StorageTypes[K];

      return valueParsed;
    }

    const item = await AsyncStorage.getItem(key);

    if (!item) {
      globalStore.setValue(key, null);
      return null;
    }

    const itemParsed = JSON.parse(item) as StorageTypes[K];

    globalStore.setValue(key, item);

    return itemParsed;
  } catch (error) {
    console.error(`Error getting storage for key ${key}:`, error);
    return null;
  }
}

/**
 * Removes a single item from storage
 * @param key Storage key
 * @returns Promise<void>
 */
export async function removeItemStorage(key: StorageKey): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item for key ${key}:`, error);
    throw error;
  }
}

/**
 * Removes all items from storage
 * @returns Promise<void>
 */
export async function removeAllStorage(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys);
    toast('success', 'Removed all keys');
  } catch (error) {
    console.error('Error removing all storage:', error);
    throw error;
  }
}

/**
 * Clears all restaurant-related storage keys
 * @returns Promise<void>
 */
export async function clearRestaurantStorageRelatedKeys(): Promise<void> {
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
    await Promise.all(keysToRemove.map((key) => removeItemStorage(key)));
    globalStore.clearStore();
  } catch (error) {
    console.error('Error clearing restaurant storage:', error);
    throw error;
  }
}
