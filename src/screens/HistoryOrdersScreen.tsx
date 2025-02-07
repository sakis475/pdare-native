import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Pressable,
} from 'react-native';

import { Divider } from 'react-native-paper';
import { colors } from '../core/theme';
import { FlashList } from '@shopify/flash-list';
import { getRequest } from '../helpers/requests';
import dayjs from '../core/dayjs';
import { CurrencyFormat } from '../components/helpers/CurrencyFormat';
import { useStrings } from '../core/localization/languageContext';
import { navigate, ScreenNames } from '../navigation/navigationUtils';
import { processTables } from '../helpers/storage/tablesStorage';
import _ from 'lodash';
import { UsersIcon } from '../components/basic/Icons';
import { Order, Table } from '../types/basic.types';
import { TableIO } from '../types/io.types';

const FONT_SIZES = {
  header: 12, // For column headers
  primary: 14, // For main content like table names, order IDs
  secondary: 13, // For supporting text like dates, counts
  small: 12, // For labels and secondary information
};

const HistoryOrdersScreen = ({ currentIndex }: any) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageNumber, setPageNumber] = useState(0);

  const strings = useStrings();

  const fetchOrders = async (page: number, isRefresh = false) => {
    if (loading || (!hasMore && !isRefresh)) return;

    setLoading(true);
    try {
      const newOrders: Order[] = await getRequest(`/orders?pageNumber=${page}`);

      if (isRefresh) {
        setOrders(newOrders ?? []);
        setPageNumber(0);
        setHasMore(true);
      } else {
        if (newOrders?.length) {
          setOrders((prev) => [...prev, ...newOrders]);
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders(0, true);
    setRefreshing(false);
  };

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = pageNumber + 1;
      console.log('Loading next page:', nextPage);
      setPageNumber(nextPage);
      fetchOrders(nextPage);
    }
  }, [loading, hasMore, pageNumber]);

  useEffect(() => {
    fetchOrders(0, true);
  }, [currentIndex]);

  const processTable = async (table: Table) => {
    const tableIOFixType = table as unknown as TableIO;
    const allTables = await processTables([tableIOFixType]);
    navigate(ScreenNames.ActiveOrderScreen, { tableParam: allTables[0] });
  };

  const RenderHeader = () => {
    return (
      <View style={[styles.rowContainer, styles.headerContainer]}>
        <View style={[styles.column, { width: '10%' }]}>
          <Text style={styles.headerText}>{strings.ORDER_ID}</Text>
        </View>
        <View style={[styles.column, { width: '15%' }]}>
          <Text style={styles.headerText}>{strings.TABLE}</Text>
        </View>
        <View style={[styles.column, { width: '15%' }]}>
          <Text style={styles.headerText}>{strings.SELECT_COUVERT}</Text>
        </View>
        <View style={[styles.column, { width: '20%' }]}>
          <Text style={styles.headerText}>{strings.TOTAL}</Text>
        </View>
        <View style={[styles.column, { width: '20%' }]}>
          <Text style={styles.headerText}>{strings.OPENED_AT}</Text>
        </View>
        <View style={[styles.column, { width: '20%' }]}>
          <Text style={styles.headerText}>{strings.CLOSED_AT}</Text>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderOrderItem = (order: Order, index: number) => {
    const startedAt = dayjs(order.createdAt).format('DD/MM/YY HH:mm');
    const closedAt = order.closedAt ? dayjs(order.closedAt).format('DD/MM/YY HH:mm') : null;
    const couvert = order.couvert ?? ' -';

    return (
      <>
        {index === 0 && <RenderHeader />}
        <Pressable
          onPress={() => {
            const deepOrder = _.cloneDeep(order);
            const deepTable = _.cloneDeep(deepOrder.table);
            deepTable.occupiedByOrder = deepOrder;
            processTable(deepTable);
          }}
        >
          <View style={styles.rowContainer}>
            <View style={[styles.column, { width: '10%' }]}>
              <Text style={styles.cellText}>{order.uniqueId ?? '-'}</Text>
            </View>
            <View style={[styles.column, { width: '15%' }]}>
              <Text style={styles.cellText}>{order.table?.tableName ?? '?'}</Text>
            </View>
            <View style={[styles.column, { width: '15%' }]}>
              <View style={styles.personsCount}>
                <UsersIcon color={colors.veryLighterGrey}></UsersIcon>
                <Text style={styles.couvertText}>{couvert}</Text>
              </View>
            </View>
            <View style={[styles.column, { width: '20%' }]}>
              <CurrencyFormat
                value={order.finalCost}
                currency={'€'}
                fontSize={FONT_SIZES.secondary}
              />
            </View>
            <View style={[styles.column, { width: '20%' }]}>
              <Text style={styles.dateText}>{startedAt}</Text>
            </View>
            <View style={[styles.column, { width: '20%' }]}>
              <Text style={[styles.dateText, order.closedAt && styles.emptyText]}>
                {closedAt || '-'}
              </Text>
            </View>
          </View>
        </Pressable>
      </>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {orders ? (
          <View style={styles.categoriesContainer}>
            <FlashList
              data={orders}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item, index }) => renderOrderItem(item, index)}
              estimatedItemSize={15}
              contentContainerStyle={styles.categoryFlashListContainer}
              showsVerticalScrollIndicator={true}
              persistentScrollbar={true}
              ItemSeparatorComponent={Divider}
              onEndReached={loadMore}
              onEndReachedThreshold={0.1}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={
                !loading && (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>{strings.NO_ORDERS_FOUND}</Text>
                  </View>
                )
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
            />
          </View>
        ) : (
          <ActivityIndicator size="large" animating={true} color={colors.primary} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#2F2F2F',
    justifyContent: 'center',
    alignContent: 'center',
    paddingHorizontal: 0,
  },
  categoriesContainer: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: colors.darkerGrey,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkGrey,
  },
  headerText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.header,
  },
  categoryFlashListContainer: {
    paddingHorizontal: 0,
  },
  rowContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkGrey,
    gap: 2,
  },
  column: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 2,
  },
  cellText: {
    fontSize: FONT_SIZES.primary,
    color: colors.white,
  },
  personsCount: {
    borderRadius: 4,
    paddingVertical: 4,
    flexDirection: 'row',
    minWidth: 50,
  },
  couvertText: {
    fontSize: FONT_SIZES.secondary,
    color: colors.white,
    marginLeft: 5,
  },
  dateText: {
    fontSize: FONT_SIZES.secondary,
    color: colors.white,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: colors.white,
  },
});

export default HistoryOrdersScreen;
