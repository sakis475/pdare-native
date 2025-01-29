import { ItemProperty, ItemReq, User } from './basic.types';

export type TableItemPropertyIO = {
  id: number;
  itemProperty: ItemProperty;
};

export type OrderItemIO = {
  id: number;
  quantity: number;
  comment: string;
  item: ItemReq;
  itemPropertyOfItem: TableItemPropertyIO[];
  removedAt?: Date;
};

export type OrderIO = {
  id: number;
  uniqueId?: string;
  table: TableIO;
  orderItems: OrderItemIO[];
  couvert: number;
  comment: string;
  createdAt: string;
  closedAt: string | null;
  orderReady: boolean;
  user: User;
  finalCost: number;
};

export type TableIO = {
  id: number;
  tableName: string;
  isEnabled: boolean;
  tableOrder: number;
  occupiedByOrder: OrderIO;
};
