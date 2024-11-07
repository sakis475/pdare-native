import { setStorage } from '../../storage/store';
import { storageInitGroupedItems } from '../storage/storageInit';
import { EventId, socketManager } from './SocketManager';

class SocketEventSubscriber {
  // Method to initialize and subscribe to all socket events
  public async initialize() {
    socketManager.on(EventId.itemsUpdated, SocketEventSubscriber.handleItemsUpdate);
    socketManager.on(EventId.categoriesUpdated, SocketEventSubscriber.handleCategoriesUpdated);
  }

  // Handler for "itemsUpdated" event
  private static async handleItemsUpdate(items: ItemReq[]): Promise<void> {
    console.log('Socket Event: handleItemsUpdate');
    console.log(items);
    setStorage('items', items);
    storageInitGroupedItems();
  }

  private static async handleCategoriesUpdated(categories: Category[]): Promise<void> {
    console.log('Socket Event: categoriesUpdated');
    setStorage('categories', categories);
  }
}

export const socketEventSubscriber = new SocketEventSubscriber();

export default SocketEventSubscriber;
