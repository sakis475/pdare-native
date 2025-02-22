import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
  RefreshControl,
  EmitterSubscription,
} from 'react-native';
import { TableBox } from '../components/helpers/TableBox';
import { HeaderBar } from '../components/helpers/HeaderBar';
import { colors } from '../core/theme';
import * as Requests from '../helpers/requests';
import { Portal } from '@gorhom/portal';
import { createNewOrder, getTempOrder } from '../helpers/storage/orderStorage';
import TableSelectBottomSheet from '../components/bottomSheets/TableSelectBottomSheet';
import { FlashList } from '@shopify/flash-list';
import { getStorage, setStorage } from '../storage/store';
import { navigate, navigateToDraft, ScreenNames } from '../navigation/navigationUtils';
import { ORDERS_UPDATED, EventEmitter } from '../helpers/Sockets/EventEmitter';
import { processTables } from '../helpers/storage/tablesStorage';
import { SCREEN_HEIGHT } from '@gorhom/bottom-sheet';
import { useStrings } from '../core/localization/languageContext';
import { Table } from '../types/basic.types';
import { storageInitTableOrders } from '../helpers/storage/storageInit';

const TablesScreen = ({ currentIndex }: any) => {
  const [activeTables, setActiveTables] = useState<Table[]>(undefined);
  const [refreshing, setRefreshing] = useState(false);
  const strings = useStrings();

  const onRefresh = async () => {
    setRefreshing(true);
    await handleTableUpdates();
    setRefreshing(false);
  };

  // Function to handle updates from socket
  const handleTableUpdates = async (): Promise<void> => {
    console.log('tables screen: ORDERS_UPDATED');
    await storageInitTableOrders();
    const updatedTables = await getStorage('tableOrders');
    setActiveTables(updatedTables);
  };

  useEffect(() => {
    const subscription = EventEmitter.addListener(ORDERS_UPDATED, handleTableUpdates);

    // Initial fetch
    if (currentIndex === undefined || currentIndex === 0) {
      handleTableUpdates();
    }
    return () => subscription.remove();
  }, [currentIndex]);

  //START TABLE MODAL LOGIC
  const bottomSheetRef = useRef<{ openModal: () => void; closeModal: () => void }>(null);

  const handleOpenModal = () => {
    bottomSheetRef.current?.openModal();
  };

  const handleCloseModal = () => {
    bottomSheetRef.current?.closeModal();
    Keyboard.dismiss();
  };

  const handleSelectTable = async (table: Table) => {
    const newTable = await createNewOrder(table);
    navigate(ScreenNames.NewOrderScreen, { table: newTable.table });
  };

  const handleExistingTable = async (table: Table) => {
    navigate(ScreenNames.ActiveOrderScreen, { tableParam: table });
  };

  const renderItems = (table: Table, index: number) => (
    <View style={styles.tableItem} key={`table-${table.id}-${index}`}>
      <TableBox
        table={table}
        onPress={(table: Table) => {
          handleExistingTable(table);
        }}
      />
    </View>
  );

  const ListEmptyComponent = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{strings.NO_ACTIVE_TABLE}</Text>
      </View>
    );
  };

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <HeaderBar headerTitle={strings.TABLES} />
      <View style={styles.container}>
        {activeTables !== undefined ? (
          <>
            <View style={styles.tableContainer}>
              <FlashList
                data={activeTables}
                renderItem={({ item, index }) => renderItems(item, index)}
                keyExtractor={(item) => `table-${item.id}`}
                estimatedItemSize={20}
                numColumns={4}
                ListEmptyComponent={ListEmptyComponent}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[colors.primary]}
                    tintColor={colors.primary}
                  />
                }
                showsVerticalScrollIndicator={false}
              />
            </View>

            <TouchableOpacity style={styles.selectTableBtn} onPress={handleOpenModal}>
              <Text style={styles.selectTableBtnText}>{strings.NEW_ORDER_BTN}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
        )}
        <Portal>
          <TableSelectBottomSheet ref={bottomSheetRef} handleSelectTable={handleSelectTable} />
        </Portal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2F2F2F',
    justifyContent: 'center',
    alignContent: 'center',
  },
  tableContainer: {
    flex: 1,
  },
  tableItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  selectTableBtn: {
    backgroundColor: 'blue',
    borderRadius: 8,
    padding: 15,
    marginVertical: 5,
    alignItems: 'center',
  },
  selectTableBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.white,
  },
  emptyContainer: {
    height: SCREEN_HEIGHT / 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.white,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default TablesScreen;
