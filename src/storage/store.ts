import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppLanguage } from '../core/strings';
import { SessionBearer } from '../types/requests.types';
import { toast } from '../core/utils';

// Function to set item in AsyncStorage
export async function setStorage<K extends StorageKey>(key: K, value: StorageTypes[K] | null) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.log(error);
  }
}

// Function to get item from AsyncStorage
export async function getStorage<K extends StorageKey>(key: K): Promise<StorageTypes[K] | null> {
  try {
    const item = await AsyncStorage.getItem(key);

    if (!item) {
      return null;
    }
    return JSON.parse(item) as StorageTypes[K];
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function removeItemStorage(key: string) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.log(error);
  }
}

export async function removeAllStorage() {
  try {
    AsyncStorage.getAllKeys()
      .then((keys) => AsyncStorage.multiRemove(keys))
      .then(() => toast('success', 'Removed all keys'));
  } catch (error) {
    console.log(error);
  }
}

export async function clearRestaurantStorageRelatedKeys() {
  try {
    await setStorage('tables', null);
    await setStorage('items', null);
    await setStorage('categories', null);
    await setStorage('groupedItems', null);
    await setStorage('tableOrders', null);
    await setStorage('personelUsers', null);
    await setStorage('propertyPatterns', null);

    await setStorage('newOrder', null);
    await setStorage('currentUser', null);
  } catch (error) {
    console.log(error);
  }
}

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
  lastestMainTabIndex: number;
  tableOrders: Table[];
}

// Type for storage keys
type StorageKey = keyof StorageTypes;
