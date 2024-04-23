interface ItemProperty {
  id: number;
  propertyName: string;
  propertyValue: string;
  propertyType: 'multiselect' | 'singleselect';
  isEnabled: boolean;
  orderGroup: number | null;
  orderItem: number | null;
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

interface Item {
  id: number;
  title: string;
  cost: number;
  orderItem: number;
  isEnabled: boolean;
  category: Category;
  itemPropertiesGrouped: ItemPropertiesGrouped;
}
