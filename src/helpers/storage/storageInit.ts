import { getStorage, setStorage } from '../../storage/store';
import * as Requests from '../requests';

// items
async function storageInitItems() {
  const items = await Requests.getRequest('/items');
  await setStorage('items', items);
  return items;
}

//categories
async function storageInitCategories() {
  let items: ItemReq[];
  items = await getStorage('items');

  if (!items) {
    items = await storageInitItems();
  }
  const categoriesAll = items.map((e) => e.category);
  const uniqueCategories = categoriesAll
    ?.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id))
    ?.sort((a, b) => a.orderCategory - b.orderCategory);

  await setStorage('categories', uniqueCategories);
  return uniqueCategories;
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
  await storageInitItems();
  await storageInitCategories();
  await storageInitGroupedItems();
}
