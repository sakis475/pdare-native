import { getStorage, setStorage } from '../../storage/store';
import { convertOccupiedOrderToOrder } from '../storage/orderStorage';
import { storageInitGroupedItems } from '../storage/storageInit';
import { processTables } from '../storage/tablesStorage';
import {
  CATEGORIES_UPDATED,
  ITEMS_UPDATED,
  ORDERS_UPDATED,
  PROPERTY_PATTERNS_UPDATED,
  EventEmitter,
  TABLES_UPDATED,
  USERS_UPDATED,
  HEALTH_CHECK_RECEIVE,
  PRINTERS_DISCOVERED_UPDATE,
} from './EventEmitter';
import { EventId, socketManager } from './SocketManager';

class SocketEventSubscriber {
  // Method to initialize and subscribe to all socket events
  public async initialize() {
    socketManager.on(EventId.itemsUpdated, SocketEventSubscriber.handleItemsUpdate);
    socketManager.on(EventId.categoriesUpdated, SocketEventSubscriber.handleCategoriesUpdated);
    socketManager.on(
      EventId.itemPropertyPatternsUpdated,
      SocketEventSubscriber.handleItemPropertiesPatternUpdated
    );
    socketManager.on(EventId.tablesUpdated, SocketEventSubscriber.handleTablesUpdated);
    socketManager.on(EventId.usersUpdated, SocketEventSubscriber.handleUsersUpdated);
    socketManager.on(EventId.tableOrdersUpdated, SocketEventSubscriber.handleTableOrdersUpdates);
    socketManager.on(EventId.healthCheck, SocketEventSubscriber.healthCheck);
    socketManager.on(EventId.printersDiscovered, SocketEventSubscriber.printersDiscovered);
  }

  static async handleTableOrdersUpdates(tables: TableIO[]): Promise<void> {
    console.log('Socket Event: handleTableOrdersUpdates');
    const updatedTables = await processTables(tables);
    await setStorage('tableOrders', updatedTables);
    EventEmitter.emit(ORDERS_UPDATED, updatedTables);
  }

  static async handleItemsUpdate(items: ItemReq[]): Promise<void> {
    console.log('Socket Event: handleItemsUpdate');
    await setStorage('items', items);
    await storageInitGroupedItems();
    EventEmitter.emit(ITEMS_UPDATED, []);
  }

  static async handleCategoriesUpdated(categories: Category[]): Promise<void> {
    console.log('Socket Event: categoriesUpdated');
    setStorage('categories', categories);
    EventEmitter.emit(CATEGORIES_UPDATED, []);
  }

  static async handleItemPropertiesPatternUpdated(
    propertyPatterns: PropertyPattern[]
  ): Promise<void> {
    console.log('Socket Event: handleItemPropertiesPatternUpdated');
    setStorage('propertyPatterns', propertyPatterns);
    EventEmitter.emit(PROPERTY_PATTERNS_UPDATED, []);
  }

  static async handleTablesUpdated(tables: Table[]): Promise<void> {
    console.log('Socket Event: handleTablesUpdated');
    await setStorage('tables', tables);
    EventEmitter.emit(TABLES_UPDATED, []);
  }

  static async handleUsersUpdated(usersAndInvitations: {
    users: User[];
    activeInvitations: InvitationRequest[];
  }): Promise<void> {
    console.log('Socket Event: handleUsersUpdated');
    await setStorage('personelUsers', usersAndInvitations.users);
    await setStorage('activeInvitations', usersAndInvitations.activeInvitations);
    EventEmitter.emit(USERS_UPDATED, []);
  }

  static async healthCheck(): Promise<void> {
    EventEmitter.emit(HEALTH_CHECK_RECEIVE, []);
  }

  static async printersDiscovered(printers: Printer[]): Promise<void> {
    EventEmitter.emit(PRINTERS_DISCOVERED_UPDATE, printers);
  }
}

export const socketEventSubscriber = new SocketEventSubscriber();

export default SocketEventSubscriber;
