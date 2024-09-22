import _ from 'lodash';
import * as Requests from '../requests';
import { getStorage, setStorage } from '../../storage/store';
import uuid from 'react-native-uuid';
import { isEnabled } from 'react-native/Libraries/Performance/Systrace';

/* Fetches all items of the catalogue and stores them in a custom format */
export const reqFetchItems = async () => {
  const fetchItems: ItemReq[] = await Requests.getRequest('/items');

  if (!fetchItems) {
    return null;
  }
  const groupedByCategory: catGroupedItems = fetchItems.reduce((acc: any, item: any) => {
    const categoryTitle = item.category.title;
    if (!acc[categoryTitle]) {
      acc[categoryTitle] = [];
    }
    acc[categoryTitle].push(item);
    return acc;
  }, {});

  await setStorage('groupedItems', groupedByCategory);
  return groupedByCategory;
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
    table: table,
    comment: '',
    orderItems: [],
  };

  await setStorage('newOrder', newOrder);

  return newOrder;
};

export const getTempOrder = async (): Promise<Order | null> => {
  const tempOrder: Order | null = await getStorage('newOrder');

  return tempOrder;
};

export const addNewItemToTemp = async (item: ItemReq) => {
  const tempOrder: Order | null = await getStorage('newOrder');

  const newItemId: string = uuid.v4() as string;
  tempOrder!.orderItems.push({ ...item, quantity: 1, newItemId });
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

export const removeItemOfTemp = async (newItemId: string) => {
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

export const convertNewOrderToRequestObject = (newOrder: Order): CreateNewOrderRequest => {
  const newOrderRequestItems = newOrder?.orderItems.map((item) => {
    const newOrderRequestItem: NewOrderRequestItem = {
      id: item.id,
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
            newOrderRequestItem.itemProperties.push(itemProperty.id);
          }
        }
      }
    }

    return newOrderRequestItem;
  });

  return {
    table: newOrder.table.id === -1 ? newOrder.table.tableName : newOrder.table.id,
    comment: newOrder.comment ? newOrder.comment : '',
    items: newOrderRequestItems,
  };
};

export const clearNewOrder = async () => {
  const clearOrder: Order = {
    table: null,
    comment: '',
    orderItems: [],
  };

  await setStorage('newOrder', clearOrder);
};

/**  */
/**
 * Converts table.occupiedByOrder to Order (storage-> newOrder)
 */
export const convertOccupiedOrderToOrder = async (tableio: TableIO): Promise<Order> => {
  const items: ItemReq[] = await Requests.getRequest('/items');
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
    table: table,
    orderItems: [],
    comment: occupiedByOrder.comment,
    createdAt: occupiedByOrder.createdAt,
  };

  for (const orderItem of occupiedByOrder.orderItems) {
    const originalItem = items.find((e) => e.id === orderItem.item?.id);
    originalItem.newItemId = uuid.v4() as string;
    originalItem.quantity = orderItem.quantity;
    originalItem.comment = orderItem.comment;
    const propertiesIds = orderItem.itemPropertyOfItem.map((e) => e.itemProperty.id);
    for (const group of Object.values(originalItem.itemPropertiesGrouped)) {
      for (const property of group) {
        if (propertiesIds.includes(property.id)) {
          property.selected = true;
        }
      }
    }

    order.orderItems.push(originalItem);
  }
  return order;
};

export const updateActiveOrdersStorage = async (activeOrders: Order[]) => {
  return await setStorage('activeOrders', activeOrders);
};
