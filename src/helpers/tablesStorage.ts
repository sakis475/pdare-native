import _ from 'lodash';
import * as Requests from './requests';
import { getStorage, setStorage } from '../storage/store';

export const reqFetchTables = async () => {
  const fetchTables: Table[] = await Requests.getRequest('/tables?availableOnly=true');

  return fetchTables;
};

export const setTable = async (table: Table) => {
  const order: NewOrder = await getStorage('newOrder');
  order.table = table;
  await setStorage('newOrder', order);
  return order;
};
