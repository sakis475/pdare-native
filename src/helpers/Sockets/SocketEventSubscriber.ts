import { getStorage, setStorage } from '../../storage/store';
import { EventId, EventString, socketManager } from './SocketManager';

class SocketEventSubscriber {
  // Method to initialize and subscribe to all socket events
  public async initialize() {
    socketManager.on(EventId.itemsUpdated, SocketEventSubscriber.handleItemsUpdate);
  }

  // Handler for "itemsUpdated" event
  private static async handleItemsUpdate(items: ItemReq[]): Promise<void> {
    const categoriesAll = items.map((e) => e.category);
    const uniqueCategories = categoriesAll
      ?.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id))
      ?.sort((a, b) => a.orderCategory - b.orderCategory);

    setStorage('categories', uniqueCategories);
    setStorage('items', items);
  }
}

export const socketEventSubscriber = new SocketEventSubscriber();

export default SocketEventSubscriber;
