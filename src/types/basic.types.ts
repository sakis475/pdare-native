export interface ItemProperty {
  id?: number;
  propertyName: string;
  propertyValue: string;
  propertyType: 'multiselect' | 'singleselect';
  isEnabled?: boolean;
  orderGroup: number | null;
  orderItem: number | null;
  selected: boolean;
  required?: boolean;
  dependsOn?: number | null;
  oItemPropertyId?: number;
  isEdited?: boolean;
  originalPropertyValue?: string;
  isDeleted?: boolean;
  isDeletedGroup?: boolean;
}

// example [Milk: [], Sugar: []]
export interface ItemPropertiesGrouped {
  [key: string]: ItemProperty[];
}

export interface Category {
  id?: number;
  title: string;
  orderCategory?: number;
  isEnabled?: boolean;
  printLocation?: PrintLocation;
  color?: string;
}

export interface PropertyPattern {
  id?: number;
  propertyPatternTitle: string;
  itemProperties: ItemProperty[];
  markAsDelete?: boolean;
  propertyPatternOrder?: number;
  category: Category;
}

export interface Restaurant {
  active: boolean;
  id: number;
  restaurantName: string;
  couvertCost: number;
  currencySymbol: string;
  isPrinterAppInstalled?: boolean;
}

export interface Item {
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

export interface ItemReq {
  id?: number;
  category: Category;
  cost: number;
  description: string;
  isEnabled: boolean;
  itemPropertiesGrouped: ItemPropertiesGrouped | ItemProperty[];
  orderItem: number;
  restaurant?: Restaurant;
  title: string;
  quantity?: number;
  newItemId?: string;
  comment?: string;
  alreadySend?: boolean;
  oItemId?: number;
  markForDelete?: boolean;
  orderItemReady?: boolean;
}
export interface catGroupedItems {
  [key: string]: ItemReq[];
}

export interface Table {
  id: number;
  tableName: string;
  isEnabled: boolean;
  tableOrder: number;
  occupiedByOrder?: Order;
}

export interface Order {
  id?: number;
  uniqueId?: string;
  table: Table;
  orderItems: ItemReq[];
  couvert: number;
  comment?: string;
  createdAt?: string;
  closedAt?: string;
  originalTable?: Table;
  finalCost?: number;
  orderReady?: boolean;
  user?: User;
}

export interface SendOrderItem {
  id: number;
  itemProperties: number[];
  quantity: number;
  comment?: string;
}

export interface OrderNavigationState {
  screenName: any;
  params: any;
}

export interface CreateNewOrderRequest {
  orderId?: number;
  table: number | string;
  comment: string;
  items: NewOrderRequestItem[];
}
export interface NewOrderRequestItem {
  id: number;
  oItemId: number;
  delete: boolean;
  itemProperties: { id: number; oItemPropertyId: number }[];
  quantity: number;
  comment: string;
}

export interface User {
  id?: number;
  active?: boolean;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  role: 'owner' | 'waiter' | 'guest';
  restaurant?: Restaurant;
  invitations?: InvitationRequest[];
  markForDelete?: boolean;
}

export interface LastCredentialsStorage {
  email: string;
  password: string;
}

export interface InvitationRequest {
  id?: number;
  inviteFrom: User;
  inviteTo: User;
  invitationStatus?: InvitationRequestStatus;
  restaurant: Restaurant;
  createdAt: Date;
}

export enum InvitationRequestStatus {
  ACCEPTED = 'accepted',
  CANCELLED = 'cancelled',
  AWAITING = 'awaiting',
}
export enum PrintLocation {
  KITCHEN = 'kitchen',
  BAR = 'bar',
  ALL = 'all',
}

export enum PrintType {
  PERSONEL = 'personel',
  FINAL = 'final',
}
export interface Printer {
  id?: number;
  printerNickname: string;
  printerMac: string;
  printerIp: string;
  printerPort: string;
  overrideIP?: string;
  overridePort?: string;
  characterSet: string;
  printLocation?: PrintLocation;
  active?: boolean;
  restaurant?: Restaurant;
  createdAt?: Date;
  updatedAt?: Date;
  lastDiscovered?: Date;
  analysisPrinter: boolean;
  isDeleted?: boolean;
}
