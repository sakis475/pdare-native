import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Keyboard, SafeAreaView, RefreshControl } from 'react-native';

import { Divider, } from 'react-native-paper';

import { colors } from '../core/theme';

import { FlashList } from '@shopify/flash-list';
import { HeaderBar } from '../components/helpers/HeaderBar';

import { AlertWithOptions } from '../core/utils';
import { getRequest } from '../helpers/requests';
import dayjs from '../core/dayjs';
import FeatherIcons from 'react-native-vector-icons/FontAwesome5';
import { CurrencyFormat } from '../components/helpers/CurrencyFormat';

const HistoryOrdersScreen = ({ currentIndex }: any) => {
  const [table, setTable] = useState<Table>();
  const [orders, setOrders] = useState<Order[]>();
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    const orders: Order[] = await getRequest('/orders');
    setOrders(orders ?? []);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [currentIndex]);


  const calculateDuration = (createdAt: string, closedAt: string) => {
    const durationInSeconds = dayjs(closedAt ?? undefined).diff(dayjs(createdAt), 'second'); // Difference in seconds

    if (durationInSeconds < 0) return 'N/A'; // If the duration is negative, return 'N/A'

    const months = Math.floor(durationInSeconds / (60 * 60 * 24 * 30)); // Approximate month as 30 days
    const days = Math.floor((durationInSeconds % (60 * 60 * 24 * 30)) / (60 * 60 * 24));
    const hours = Math.floor((durationInSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((durationInSeconds % (60 * 60)) / 60);

    let durationString = '';
    const maxUnitsDisplay = 2;
    let unitsCount = 0;
    if (months > 0) {
      durationString += `${months}mo `;
      unitsCount++;
    }
    if (days > 0) {
      durationString += `${days}d `;
      unitsCount++;
    }

    if (unitsCount < maxUnitsDisplay) {
      durationString += `${hours}h `;
      unitsCount++;
    }
    if (unitsCount < maxUnitsDisplay) {
      // Show minutes if it's the smallest unit
      durationString += `${minutes}m `;
      unitsCount++;
    }

    return durationString.trim(); // Trim any extra spaces
  };

  const renderOrderItem = (order: Order) => {
    const startedAt = dayjs(order.createdAt);
    const closedAt = dayjs(order.closedAt ?? new Date());
    const couvert = order.couvert ?? ' -';
    const durationString = calculateDuration(order.createdAt, order.closedAt);
    const formattedStartedAt = startedAt.format('DD/MM/YY HH:mm');
    const formattedClosedAt = closedAt.format('DD/MM/YY HH:mm');

    return (
      <View style={styles.rowContainer}>
        <View style={[styles.column, { width: '15%' }]}>
          <Text style={styles.tableName}>{order.table?.tableName ?? '?'}</Text>
        </View>

        <View style={[styles.column, { width: '15%', minWidth: 20 }]}>
          <View style={styles.personsCount}>
            <FeatherIcons name="users" size={13} color={colors.veryLighterGrey} />
            <Text style={styles.couvertText}>{couvert}</Text>
          </View>
        </View>

        <View style={[styles.column, { width: '25%' }]}>
          <CurrencyFormat value={order.finalCost} currency={'€'} fontSize={13} />
        </View>

        <View style={[styles.column, { width: '20%' }]}>
          <Text style={styles.durationText}>
            <FeatherIcons name="clock" size={13} color={colors.veryLighterGrey} /> {durationString}
          </Text>
        </View>

        <View style={[styles.column, { width: '25%' }]}>
          {!order.closedAt ? (
            <>
              <Text style={styles.activeTag}>Active</Text>
              <Text style={styles.startedAtText}>Άνοιξε: {formattedStartedAt}</Text>
            </>
          ) : (
            <>
              <Text style={styles.closedTag}>Closed</Text>
              <Text style={styles.closedAtText}>Έκλεισε: {formattedClosedAt}</Text>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {orders && orders.length > 0 ? (
          <>
            <View style={styles.categoriesContainer}>
              <FlashList
                data={orders}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => renderOrderItem(item)}
                estimatedItemSize={15}
                contentContainerStyle={styles.categoryFlashListContainer}
                showsVerticalScrollIndicator={true}
                persistentScrollbar={true}
                ItemSeparatorComponent={Divider}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[colors.primary]} // Android
                    tintColor={colors.primary} // iOS
                  />
                }
              />
            </View>
          </>
        ) : orders?.length === 0 ? (
          <>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={{ textAlign: 'center', color: '#ffffff' }}>
                Δεν βρέθηκε καμία παραγγελία.
              </Text>
            </View>
          </>
        ) : (
          <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
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
    // height: 50, // Set a fixed height for the container of the FlatList
    // backgroundColor: 'red',
    flex: 1,
  },
  categoriesFlatList: {
    flexGrow: 0, // Prevent FlatList from growing beyond the orders it contains
  },
  categoriesList: {
    alignItems: 'center',
    paddingRight: 16, // Adds padding to the end of the list for better scrolling experience
  },
  categoryItem: {
    backgroundColor: 'grey',
    borderRadius: 2,
    paddingVertical: 12,
    paddingHorizontal: 60, //categoriesLength > 3 ? 16 : 36,
    // width: 150,
    marginHorizontal: 2,
  },
  categoryText: {
    color: 'white',
    fontWeight: 'bold',
    margin: 0,
    textAlign: 'center',
  },
  tableButtonContainer: {
    alignItems: 'flex-end',
    paddingVertical: 2,
    backgroundColor: colors.darkerGrey,
  },
  tableButton: {
    // position: 'absolute',
    // right: 20,
    // bottom: 20,
    marginRight: 20,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'blue',
    padding: 4,
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableChangeContainer: {
    paddingTop: 20,
    paddingHorizontal: 2,
    justifyContent: 'center',
    height: 300,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Adjust color and opacity as needed
  },
  categoryBox: {
    width: 100,
    height: 100,
    borderColor: 'fff',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryFlashListContainer: { paddingHorizontal: 0 },

  //
  personsCount: {
    backgroundColor: colors.darkBlue,
    borderRadius: 4,
    paddingVertical: 1,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 50,
  },

  rowContainer: {
    minHeight: 70,
    width: '100%',
    flexDirection: 'row', // Align items horizontally
    justifyContent: 'flex-start', // Align horizontally to the left
    alignItems: 'center', // Align vertically to the center
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    gap: 2,
  },
  column: {
    width: '20%', // Ensure each section takes 25% width
    justifyContent: 'center', // Center content vertically
    alignItems: 'flex-start',
    paddingHorizontal: 2,
  },
  tableName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  couvertText: {
    fontSize: 13,
    color: colors.white,
    marginLeft: 5, // Add some space between the icon and the text
  },
  durationText: {
    fontSize: 13,
    textAlign: 'center', // Center text horizontally
    color: colors.white,
  },
  activeTag: {
    color: colors.white,
    textAlign: 'center',
    backgroundColor: colors.green,
    borderRadius: 10,
    paddingHorizontal: 5,
    width: 80,
  },
  closedTag: {
    color: colors.white,
    textAlign: 'center',
    backgroundColor: colors.lightRed,
    borderRadius: 10,
    paddingHorizontal: 5,
    width: 80,
  },
  startedAtText: {
    fontSize: 12,
    color: colors.white,
    textAlign: 'left',
    marginLeft: 4,
  },
  closedAtText: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'left',
    marginLeft: 4,
  },
});
export default HistoryOrdersScreen;
