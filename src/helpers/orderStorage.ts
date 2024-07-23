import _ from 'lodash';
import * as Requests from './requests';
import { getStorage, setStorage } from '../storage/store';

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
  const newItemId = tempOrder.items?.length ?? 1 + 1;
  tempOrder.items.push({ ...item, quantity: 1, newItemId });
  // }
  await setStorage('newOrder', tempOrder);
};

export const updateQuantityOfTempItem = async (quantity: number, newItemId: number) => {
  if (!quantity) return;
  const tempOrder: NewOrder = await getStorage('newOrder');
  const itemIndex = tempOrder.items.findIndex((e) => e.newItemId === newItemId);

  if (itemIndex !== -1) {
    tempOrder.items[itemIndex].quantity = quantity;
    await setStorage('newOrder', tempOrder);
  }
};

export const updateItemOfTempItem = async (item: ItemReq, newItemId: number) => {
  console.dir(item, { depth: null });

  const tempOrder: NewOrder = await getStorage('newOrder');
  const itemIndex = tempOrder.items.findIndex((e) => e.newItemId === newItemId);

  if (itemIndex !== -1) {
    tempOrder.items[itemIndex] = item;
    await setStorage('newOrder', tempOrder);
  }
};

export const removeItemOfTemp = async (newItemId: number) => {
  const tempOrder: NewOrder = await getStorage('newOrder');

  const itemIndex = tempOrder.items.findIndex((i) => i.newItemId === newItemId);

  if (itemIndex !== -1) {
    tempOrder.items.splice(itemIndex, 1);
    await setStorage('newOrder', tempOrder);
    return tempOrder;
  } else {
    throw new Error('Item not found');
  }
};
//--------- New Order Storage ------//
