interface ItemProperty {
  id: number;
  propertyName: string;
  propertyValue: string;
  propertyType: 'multiselect' | 'singleselect';
  isEnabled: boolean;
  orderGroup: number | null;
  orderItem: number | null;
  selected: boolean;
}

// example [Milk: [], Sugar: []]
interface ItemPropertiesGrouped {
  [key: string]: ItemProperty[];
}

interface Category {
  id: number;
  title: string;
  orderCategory: number;
}

interface Restaurant {
  active: boolean;
  id: number;
  restaurantName: string;
}

interface Item {
  categoryCurrentId?: number;
  categoryTitle?: string;
  id: number;
  title: string;
  cost: number;
  orderItem: number;
  isEnabled: boolean;
  category: Category;
  itemPropertiesGrouped: ItemPropertiesGrouped;
}

interface ItemReq {
  id: number;
  category: Category;
  cost: number;
  isEnabled: boolean;
  itemPropertiesGrouped: ItemPropertiesGrouped | ItemProperty[];
  orderItem: number;
  restaurant: Restaurant;
  title: string;
  quantity?: number;
  newItemId?: number;
}

interface catGroupedItems {
  [key: string]: ItemReq[];
}

interface Table {
  id: number;
  isEnabled: boolean;
  tableName: string;
  tableOrder: number;
}

interface NewOrder {
  table: Table;
  items: ItemReq[];
  comment?: string;
}

interface SendOrderItem {
  id: number;
  itemProperties: number[];
  quantity: number;
  comment?: string;
}
