import { setStorage } from '../../storage/store';
import { storageInitGroupedItems } from '../storage/storageInit';
import { EventId, socketManager } from './SocketManager';

class SocketEventSubscriber {
  // Method to initialize and subscribe to all socket events
  public async initialize() {
    socketManager.on(EventId.itemsUpdated, SocketEventSubscriber.handleItemsUpdate);
  }

  // Handler for "itemsUpdated" event
  private static async handleItemsUpdate(items: ItemReq[]): Promise<void> {
    console.log('Socket Event: handleItemsUpdate');

    const categoriesAll = items.map((e) => e.category);
    const uniqueCategories = categoriesAll
      ?.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id))
      ?.sort((a, b) => a.orderCategory - b.orderCategory);

    setStorage('categories', uniqueCategories);
    setStorage('items', items);
    storageInitGroupedItems();
  }
}

export const socketEventSubscriber = new SocketEventSubscriber();

export default SocketEventSubscriber;
