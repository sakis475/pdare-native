import _ from 'lodash';
import * as Requests from '../requests';
import { getStorage, setStorage } from '../../storage/store';
import { convertOccupiedOrderToOrder } from './orderStorage';

export const reqFetchTables = async () => {
  const fetchTables: Table[] = await Requests.getRequest('/tables?availableOnly=true');

  return fetchTables;
};

export const setTable = async (table: Table) => {
  const order: Order = await getStorage('newOrder');
  if (!order) return;
  order.table = table;
  await setStorage('newOrder', order);
  return order;
};

export const processTables = async (tablesIO: TableIO[]): Promise<Table[]> => {
  const items: ItemReq[] = await getStorage('items');

  return tablesIO.reduce((acc: Table[], table: TableIO) => {
    if (table.occupiedByOrder) {
      const occupiedByOrder = convertOccupiedOrderToOrder(table, items);
      acc.push({
        id: table.id,
        tableName: table.tableName,
        isEnabled: table.isEnabled,
        tableOrder: table.tableOrder,
        occupiedByOrder: occupiedByOrder,
      });
    }
    return acc;
  }, []);
};
