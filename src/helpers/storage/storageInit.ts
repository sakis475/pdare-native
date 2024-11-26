import { getStorage, setStorage } from '../../storage/store';
import * as Requests from '../requests';
import { processTables } from './tablesStorage';

// active tables
async function storageInitTableOrders() {
  const tables: TableIO[] = await Requests.getRequest('/tables');
  const updatedTables = await processTables(tables);
  await setStorage('activeTables', updatedTables);
}

// active tables
async function storageInitTables() {
  const tables = await Requests.getRequest('/tables/active');
  await setStorage('tables', tables);
  return tables;
}

// items
async function storageInitItems() {
  const items = await Requests.getRequest('/items');
  await setStorage('items', items);
  return items;
}

// categories
async function storageInitCategories() {
  const categories: Category[] = await Requests.getRequest('/categories/active');

  await setStorage('categories', categories);
  return categories;
}

// groupedItems;
export async function storageInitGroupedItems() {
  let items: ItemReq[];
  items = await getStorage('items');

  if (!items) {
    items = await storageInitItems();
  }
  const groupedByCategory: catGroupedItems = items.reduce((acc: any, item: any) => {
    const categoryTitle = item.category.title;
    if (!acc[categoryTitle]) {
      acc[categoryTitle] = [];
    }
    acc[categoryTitle].push(item);
    return acc;
  }, {});

  await setStorage('groupedItems', groupedByCategory);
  return groupedByCategory;
}

export async function storageInitData() {
  await storageInitTables();
  await storageInitItems();
  await storageInitCategories();
  await storageInitGroupedItems();
  await storageInitTableOrders();
}
