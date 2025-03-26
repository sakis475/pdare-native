import _ from 'lodash';
import * as Requests from '../requests';
import { getStorage, setStorage } from '../../storage/store';
import { convertOccupiedOrderToOrder } from './orderStorage';
import { ItemReq, Order, Table } from '../../types/basic.types';
import { TableIO } from '../../types/io.types';

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
  const tables: Table[] = [];
  for (const tableIO of tablesIO) {
    if (tableIO.occupiedByOrder) {
      const occupiedByOrder = convertOccupiedOrderToOrder(tableIO, items);

      tables.push({
        id: tableIO.id,
        tableName: tableIO.tableName,
        isEnabled: tableIO.isEnabled,
        tableOrder: tableIO.tableOrder,
        occupiedByOrder: occupiedByOrder,
      });
    }
  }
  return tables;
};
