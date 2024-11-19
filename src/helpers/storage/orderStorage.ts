import _ from 'lodash';
import * as Requests from '../requests';
import { getStorage, setStorage } from '../../storage/store';
import uuid from 'react-native-uuid';

/* Fetches all items of the catalogue and stores them in a custom format */
export const reqFetchItems = async () => {
  // let items: ItemReq[];
  // items = await getStorage('items');
  // if (!items) {
  //   items = await Requests.getRequest('/items');
  //   await setStorage('items', items);
  //   const categoriesAll = items.map((e) => e.category);
  //   const uniqueCategories = categoriesAll
  //     ?.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id))
  //     ?.sort((a, b) => a.orderCategory - b.orderCategory);
  //   setStorage('categories', uniqueCategories);
  // }
  // const groupedByCategory: catGroupedItems = items.reduce((acc: any, item: any) => {
  //   const categoryTitle = item.category.title;
  //   if (!acc[categoryTitle]) {
  //     acc[categoryTitle] = [];
  //   }
  //   acc[categoryTitle].push(item);
  //   return acc;
  // }, {});
  // await setStorage('groupedItems', groupedByCategory);
  // return groupedByCategory;
};

export const getGroupedItems = async () => {
  const groupedByCategory: catGroupedItems | null = await getStorage('groupedItems');
  return groupedByCategory;
};

//+++++++ New Order Storage ++++++++//
export const setTableTempOrder = async (table: Table) => {
  const order: Order | null = await getStorage('newOrder');

  if (!order) return null;

  if (order) {
    order.table = table;
  }
  await setStorage('newOrder', order);
  return order;
};

export const getTableTempOrder = async () => {
  const order: Order | null = await getStorage('newOrder');

  if (order?.table) {
    return order.table;
  } else {
    return null;
  }
};

export const createNewOrder = async (table: Table): Promise<Order> => {
  const newOrder: Order = {
    table: {
      id: table.id,
      tableName: table.tableName,
      isEnabled: table.isEnabled,
      tableOrder: table.tableOrder,
      occupiedByOrder: null,
    },
    comment: '',
    couvert: null,
    orderItems: [],
  };

  await setStorage('newOrder', newOrder);

  return newOrder;
};

export const getTempOrder = async (): Promise<Order | null> => {
  const tempOrder: Order | null = await getStorage('newOrder');

  return tempOrder;
};

export const setTempOrder = async (order: Order): Promise<Order | null> => {
  await setStorage('newOrder', order);

  return order;
};

export const addNewItemToTemp = async (item: ItemReq) => {
  const tempOrder: Order | null = await getStorage('newOrder');

  const newItemId: string = uuid.v4() as string;
  tempOrder!.orderItems.push({
    ...item,
    quantity: 1,
    newItemId,
  });
  await setStorage('newOrder', tempOrder);
};

export const updateQuantityOfTempItem = async (quantity: number, newItemId: string) => {
  if (!quantity) return;
  const tempOrder: Order | null = await getStorage('newOrder');
  const itemIndex = tempOrder!.orderItems.findIndex((e) => e.newItemId === newItemId);

  if (itemIndex !== -1) {
    tempOrder!.orderItems[itemIndex].quantity = quantity;
    await setStorage('newOrder', tempOrder);
  }
};

export const updateItemOfTempItem = async (item: ItemReq, newItemId: string) => {
  const tempOrder: Order | null = await getStorage('newOrder');
  const itemIndex = tempOrder!.orderItems.findIndex((e) => e.newItemId === newItemId);

  if (itemIndex !== -1) {
    tempOrder!.orderItems[itemIndex] = item;
    await setStorage('newOrder', tempOrder);
  }
};

export const removeItemOfTemp = async (newItemId?: string) => {
  const tempOrder: Order | null = await getStorage('newOrder');

  const itemIndex = tempOrder!.orderItems.findIndex((i) => i.newItemId === newItemId);

  if (itemIndex !== -1) {
    tempOrder!.orderItems.splice(itemIndex, 1);
    await setStorage('newOrder', tempOrder);
    return tempOrder;
  } else {
    console.log('Item not found');
  }
};
//--------- New Order Storage ------//
export const isItemPropertiesGrouped = (value: any): value is ItemPropertiesGrouped => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const clearNewOrder = async () => {
  const clearOrder: Order = {
    table: null,
    couvert: null,
    comment: '',
    orderItems: [],
  };

  await setStorage('newOrder', clearOrder);
};

export const markActiveItemForDelete = async (item: ItemReq) => {
  const tempOrder: Order | null = await getStorage('newOrder');

  const itemToMarkAsDelete = tempOrder.orderItems.find((e) => e.oItemId === item.oItemId);

  if (itemToMarkAsDelete) {
    itemToMarkAsDelete.markForDelete = !itemToMarkAsDelete.markForDelete;
  }
  await setStorage('newOrder', tempOrder);
};

export const convertNewOrderToRequestObject = (newOrder: Order): CreateNewOrderRequest => {
  const newOrderRequestItems = newOrder?.orderItems
    .filter((e) => !e.alreadySend || e.markForDelete)
    .map((item) => {
      const newOrderRequestItem: NewOrderRequestItem = {
        id: item.id,
        oItemId: item.oItemId ?? null,
        delete: item.markForDelete ? true : false,
        itemProperties: [],
        quantity: item.quantity ? item.quantity : 1,
        comment: item.comment ? item.comment : '',
      };

      if (
        isItemPropertiesGrouped(item.itemPropertiesGrouped) &&
        Object.keys(item.itemPropertiesGrouped).length > 0
      ) {
        for (const itemPropertyGroup of Object.keys(item.itemPropertiesGrouped)) {
          const group: ItemProperty[] = item.itemPropertiesGrouped[itemPropertyGroup];

          for (const itemProperty of group) {
            if (itemProperty.selected) {
              newOrderRequestItem.itemProperties.push({
                id: itemProperty.id,
                oItemPropertyId: itemProperty.oItemPropertyId ?? null,
              });
            }
          }
        }
      }

      return newOrderRequestItem;
    });

  const newReqOrder = {
    table: newOrder.table.id === -1 ? newOrder.table.tableName : newOrder.table.id,
    comment: newOrder.comment ? newOrder.comment : '',
    items: newOrderRequestItems,
  };
  if (newOrder.id) {
    Object.assign(newReqOrder, { orderId: newOrder.id });
  }
  return newReqOrder;
};

/**  */
/**
 * Converts table.occupiedByOrder to Order (storage-> newOrder)
 */
export const convertOccupiedOrderToOrder = (tableio: TableIO, items: ItemReq[]): Order => {
  const occupiedByOrder = tableio.occupiedByOrder;
  if (!items || occupiedByOrder?.orderItems?.length < 1) {
    return null;
  }

  const table: Table = {
    id: tableio.id,
    tableName: tableio.tableName,
    isEnabled: tableio.isEnabled,
    tableOrder: tableio.tableOrder,
  };
  const order: Order = {
    id: occupiedByOrder.id,
    table: table,
    originalTable: table,
    orderItems: [],
    couvert: occupiedByOrder.couvert,
    comment: occupiedByOrder.comment,
    createdAt: occupiedByOrder.createdAt,
  };
  for (const orderItem of occupiedByOrder.orderItems) {
    try {
      const originalItem = _.cloneDeep(items.find((e) => e.id === orderItem?.item?.id));
      originalItem.newItemId = uuid.v4() as string;
      originalItem.quantity = orderItem.quantity;
      originalItem.comment = orderItem.comment;
      originalItem.alreadySend = true;
      originalItem.oItemId = orderItem.id;
      const propertiesIds = orderItem.itemPropertyOfItem.map((e) => e.itemProperty.id);

      for (const group of Object.values(originalItem.itemPropertiesGrouped)) {
        for (const property of group) {
          if (propertiesIds.includes(property.id)) {
            property.selected = true;
            property.oItemPropertyId = orderItem.itemPropertyOfItem.find(
              (e) => e.itemProperty.id === property.id
            ).id;
          }
        }
      }
      order.orderItems.push(originalItem);
    } catch (error) {
      console.log(error);
      // console.log(orderItem, 'orderItem');
      // console.log(items, 'items');
    }
  }
  return order;
};

export const updateActiveOrdersStorage = async (activeOrders: Order[]) => {
  return await setStorage('activeOrders', activeOrders);
};

export const getItems = async () => {
  const items: ItemReq[] = await getStorage('items');
  return items;
};

export const setItems = async (items: ItemReq[]) => {
  await setStorage('items', items);
};

export const getItem = async (id: number) => {
  const items = await getItems();
  const item = items.find((e) => e.id === id);
  if (!item) return null;
  return item;
};

export const updateItem = async (updatedItem: ItemReq) => {
  let items = await getItems();
  const storageItemIndex = items.findIndex((e) => e.id === updatedItem.id);
  if (storageItemIndex > 0) {
    items[storageItemIndex] = updatedItem;
    setItems(items);
  }
};

export const getItemsOfCategory = async (category: Category) => {
  const allItems = await getItems();
  const items = allItems.filter((e) => e.category.id === category.id);
  if (!items) return [];
  return items;
};

export const findCategoryByTitle = async (categoryTitle: string) => {
  const allCategories = await getStorage('categories');

  const category = allCategories.find((e) => e.title === categoryTitle);

  if (category) return category;
  else return null;
};

export const getItemPropertyPatterns = async () => {
  return await getStorage('propertyPatterns');
};

export const setItemPropertyPatterns = async (itemPropertyPatterns: PropertyPattern[]) => {
  return await setStorage('propertyPatterns', itemPropertyPatterns);
};

export const updateTableOfOrder = async (order: Order, newTable: Table) => {
  order.table = newTable;
  const convertedServerOrder = convertNewOrderToRequestObject(order);

  return await Requests.patchRequest(
    `/orders/${convertedServerOrder?.orderId}`,
    convertedServerOrder
  );
};
