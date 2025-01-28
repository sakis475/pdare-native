type TableItemPropertyIO = {
  id: number;
  itemProperty: ItemProperty;
};

type OrderItemIO = {
  id: number;
  quantity: number;
  comment: string;
  item: ItemReq;
  itemPropertyOfItem: TableItemPropertyIO[];
  removedAt?: Date;
};

type OrderIO = {
  id: number;
  uniqueId?: string;
  table: Table;
  orderItems: OrderItemIO[];
  couvert: number;
  comment: string;
  createdAt: string;
  closedAt: string | null;
  orderReady: boolean;
  user: User;
  finalCost: number;
};

type TableIO = {
  id: number;
  tableName: string;
  isEnabled: boolean;
  tableOrder: number;
  occupiedByOrder: OrderIO;
};
