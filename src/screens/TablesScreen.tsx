import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  SafeAreaView,
  Keyboard,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { TableBox } from '../components/helpers/TableBox';

import { strings } from '../core/strings';
import { HeaderBar } from '../components/helpers/HeaderBar';

import { colors } from '../core/theme';
import * as Requests from '../helpers/requests';
import { Portal } from '@gorhom/portal';
import {
  convertOccupiedOrderToOrder,
  createNewOrder,
  getTempOrder,
  updateActiveOrdersStorage,
} from '../helpers/storage/orderStorage';
import TableSelectBottomSheet from '../components/bottomSheets/TableSelectBottomSheet';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import _ from 'lodash';
import { FlashList } from '@shopify/flash-list';
import { EventId, socketManager } from '../helpers/Sockets/SocketManager';
import { getStorage } from '../storage/store';
import { navigate, navigateToDraft, ScreenNames } from '../navigation/navigationUtils';

const TablesScreen = ({ currentIndex }: any) => {
  const fetchInitialTables = async (): Promise<void> => {
    try {
      const allTablesIO: TableIO[] = await Requests.getRequest('/tables');
      if (!allTablesIO) {
        return;
      }
      const allTables = await processTables(allTablesIO);
      setActiveTables(allTables);
    } catch (error) {
      console.error('Error fetching initial table data:', error);
    }
  };

  // Function to handle updates from socket
  const handleTableUpdates = async (updatedTablesIO: TableIO[]): Promise<void> => {
    const updatedTables = await processTables(updatedTablesIO);
    setActiveTables(updatedTables);
  };

  // Function to process table data
  const processTables = async (tablesIO: TableIO[]): Promise<Table[]> => {
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

  useEffect(() => {
    socketManager.on(EventId.tableOrdersUpdated, handleTableUpdates);
    fetchInitialTables();
    return () => {
      socketManager.off(EventId.tableOrdersUpdated);
    };
  }, []);

  //This propably is not needed because every component mounts it will listen for socket emitter
  useEffect(() => {
    if (currentIndex && currentIndex !== 0) return;
    // Fetch initial data
    fetchInitialTables();
  }, [currentIndex]);

  const [activeTables, setActiveTables] = useState<Table[]>(undefined);

  //START TABLE MODAL LOGIC
  const bottomSheetRef = useRef<{ openModal: () => void; closeModal: () => void }>(null);

  const handleOpenModal = () => {
    bottomSheetRef.current?.openModal();
  };

  const handleCloseModal = () => {
    bottomSheetRef.current?.closeModal();
    Keyboard.dismiss();
  };

  //END TABLE MODAL LOGIC

  const handleSelectTable = async (table: Table) => {
    const newTable = await createNewOrder(table);
    navigate(ScreenNames.NewOrderScreen, { table: newTable.table });
  };

  const handleExistingTable = async (table: Table) => {
    const tempOrder = await getTempOrder();

    if (tempOrder?.table?.id === table?.id) {
      navigateToDraft();
    } else {
      navigate(ScreenNames.ActiveOrderScreen, { tableParam: table });
    }
  };
  const renderItems = (table: Table, index: number) => (
    <View style={styles.tableItem} key={table.id}>
      <TableBox
        table={table}
        onPress={(table: Table) => {
          handleExistingTable(table);
        }}
      ></TableBox>
    </View>
  );
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HeaderBar headerTitle={strings.Tables}></HeaderBar>
      <View style={styles.container}>
        {activeTables && activeTables.length > 0 ? (
          <>
            <View style={styles.tableContainer}>
              <FlashList
                data={activeTables}
                renderItem={({ item, index }) => renderItems(item, index)}
                keyExtractor={(item) => item.tableName + item.id}
                estimatedItemSize={20}
                numColumns={4}
              />
            </View>

            <TouchableOpacity style={styles.selectTableBtn} onPress={handleOpenModal}>
              <Text style={styles.selectTableBtnText}>{strings.NewOrderBtn}</Text>
            </TouchableOpacity>
          </>
        ) : activeTables && activeTables?.length === 0 ? (
          <>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={{ textAlign: 'center', color: '#ffffff' }}>
                Δεν υπάρχουν ενεργά Τραπέζια
              </Text>
            </View>
          </>
        ) : (
          <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
        )}
        <Portal>
          <TableSelectBottomSheet ref={bottomSheetRef} handleSelectTable={handleSelectTable} />
        </Portal>
      </View>
    </SafeAreaView>
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
    padding: 20,
    marginVertical: 10,
    alignItems: 'center',
  },
  selectTableBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.white,
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
});

export default TablesScreen;
