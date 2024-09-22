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
  isEnabled?: boolean;
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
  description: string;
  isEnabled: boolean;
  itemPropertiesGrouped: ItemPropertiesGrouped | ItemProperty[];
  orderItem: number;
  restaurant: Restaurant;
  title: string;
  quantity?: number;
  newItemId?: string;
  comment?: string;
}

interface catGroupedItems {
  [key: string]: ItemReq[];
}

interface Table {
  id: number;
  isEnabled: boolean;
  tableName: string;
  tableOrder: number;
  occupiedByOrder?: Order;
}

interface Order {
  table: Table;
  orderItems: ItemReq[];
  comment?: string;
  createdAt?: string;
  closedAt?: string;
}

interface SendOrderItem {
  id: number;
  itemProperties: number[];
  quantity: number;
  comment?: string;
}

interface OrderNavigationState {
  screenName: any;
  params: any;
}

interface CreateNewOrderRequest {
  table: number | string;
  comment: string;
  items: NewOrderRequestItem[];
}
interface NewOrderRequestItem {
  id: number;
  itemProperties: number[];
  quantity: number;
  comment: string;
}

interface User {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}
