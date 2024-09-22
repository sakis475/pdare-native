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
};

type OrderIO = {
  id: number;
  createdAt: string;
  closedAt: string | null;
  comment: string;
  orderItems: OrderItemIO[];
  table: {
    id: number;
    tableName: string;
    isEnabled: boolean;
    tableOrder: number | null;
  };
};

type TableIO = {
  id: number;
  tableName: string;
  isEnabled: boolean;
  tableOrder: number | null;
  occupiedByOrder: OrderIO | null;
};
