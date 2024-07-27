import _ from 'lodash';
import * as Requests from './requests';
import { getStorage, setStorage } from '../storage/store';
import uuid from 'react-native-uuid';

export const reqFetchItems = async () => {
  const fetchItems: ItemReq[] = await Requests.getRequest('/items');

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
  const groupedByCategory: catGroupedItems = await getStorage('groupedItems');
  return groupedByCategory;
};

//+++++++ New Order Storage ++++++++//
export const setTableTempOrder = async (table: Table) => {
  const order: NewOrder = await getStorage('newOrder');
  order.table = table;
  await setStorage('newOrder', order);
  return order;
};

export const getTableTempOrder = async () => {
  const order: NewOrder = await getStorage('newOrder');

  if (order?.table) {
    return order.table;
  } else {
    return null;
  }
};

export const createNewOrder = async (table: Table): Promise<NewOrder> => {
  console.log('createNewOrder HIT');
  const newOrder: NewOrder = {
    table: table,
    comment: '',
    items: [],
  };

  await setStorage('newOrder', newOrder);

  return newOrder;
};

export const getTempOrder = async (): Promise<NewOrder> => {
  const tempOrder: NewOrder = await getStorage('newOrder');

  return tempOrder;
};

export const addNewItemToTemp = async (item: ItemReq) => {
  const tempOrder: NewOrder = await getStorage('newOrder');

  // const existingItemIndex = tempOrder.items?.findIndex((i) => {
  //   return i.id === item.id && _.isEqual(i.itemPropertiesGrouped, item.itemPropertiesGrouped);
  // });
  // if (existingItemIndex >= 0) {
  //   //handle already existing item
  //   tempOrder.items[existingItemIndex].quantity =
  //     (tempOrder.items[existingItemIndex].quantity || 1) + 1;
  // } else {
  const newItemId: string = uuid.v4() as string;
  tempOrder.items.push({ ...item, quantity: 1, newItemId });
  // }
  await setStorage('newOrder', tempOrder);
};

export const updateQuantityOfTempItem = async (quantity: number, newItemId: string) => {
  if (!quantity) return;
  const tempOrder: NewOrder = await getStorage('newOrder');
  const itemIndex = tempOrder.items.findIndex((e) => e.newItemId === newItemId);

  if (itemIndex !== -1) {
    tempOrder.items[itemIndex].quantity = quantity;
    await setStorage('newOrder', tempOrder);
  }
};

export const updateItemOfTempItem = async (item: ItemReq, newItemId: string) => {
  console.dir(item, { depth: null });

  const tempOrder: NewOrder = await getStorage('newOrder');
  const itemIndex = tempOrder.items.findIndex((e) => e.newItemId === newItemId);

  if (itemIndex !== -1) {
    tempOrder.items[itemIndex] = item;
    await setStorage('newOrder', tempOrder);
  }
};

export const removeItemOfTemp = async (newItemId: string) => {
  const tempOrder: NewOrder = await getStorage('newOrder');

  const itemIndex = tempOrder.items.findIndex((i) => i.newItemId === newItemId);

  if (itemIndex !== -1) {
    tempOrder.items.splice(itemIndex, 1);
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

export const convertNewOrderToRequestObject = (newOrder: NewOrder): CreateNewOrderRequest => {
  const newOrderRequestItems = newOrder.items.map((item) => {
    const newOrderRequestItem: NewOrderRequestItem = {
      id: item.id,
      itemProperties: [],
      quantity: item.quantity ? item.quantity : 1,
      comment: '',
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
    table: newOrder.table.id,
    comment: newOrder.comment ? newOrder.comment : '',
    items: newOrderRequestItems,
  };
};
