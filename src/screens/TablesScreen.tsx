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
import { ScreenNames, navigate, navigateToDraft } from '../navigation/AppNavigator';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import _ from 'lodash';
import { FlashList } from '@shopify/flash-list';

const TablesScreen = ({ route }: any) => {
  const isFocused = useIsFocused();
  useFocusEffect(
    useCallback(() => {
      return () => {
        fetchData();
      };
    }, [])
  );

  /**This should be handled by sockets! */
  const fetchData = async () => {
    try {
      const allTablesIO: TableIO[] = await Requests.getRequest('/tables');
      const items: ItemReq[] = await Requests.getRequest('/items');
      const allTables: Table[] = [];

      for (const table of allTablesIO) {
        let occupiedByOrder: Order = null;
        if (table.occupiedByOrder) {
          occupiedByOrder = convertOccupiedOrderToOrder(table, items);
        } else {
          continue;
        }

        const _table: Table = {
          id: table.id,
          tableName: table.tableName,
          isEnabled: table.isEnabled,
          tableOrder: table.tableOrder,
          occupiedByOrder: occupiedByOrder,
        };
        allTables.push(_table);
      }

      setActiveTables(allTables);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isFocused]);

  const [activeTables, setActiveTables] = useState<Table[]>([]);

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
        <View style={styles.tableContainer}>
          <FlashList
            data={activeTables}
            renderItem={({ item, index }) => renderItems(item, index)}
            keyExtractor={(item) => item.tableName + item.id}
            estimatedItemSize={20}
            numColumns={3}
          />
        </View>

        <TouchableOpacity style={styles.selectTableBtn} onPress={handleOpenModal}>
          <Text style={styles.selectTableBtnText}>{strings.NewOrderBtn}</Text>
        </TouchableOpacity>
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
