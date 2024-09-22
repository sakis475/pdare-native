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
  updateActiveOrdersStorage,
} from '../helpers/storage/orderStorage';
import TableSelectBottomSheet from '../components/bottomSheets/TableSelectBottomSheet';
import { ScreenNames, navigate } from '../navigation/AppNavigator';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { setStorage } from '../storage/store';

const TablesScreen = ({ route }: any) => {
  const isFocused = useIsFocused();
  useFocusEffect(
    useCallback(() => {
      return () => {
        fetchData();
      };
    }, [])
  );
  const fetchData = async () => {
    try {
      const allTables = await Requests.getRequest('/tables');

      const activeOrders: Order[] = [];
      for (const table of allTables) {
        if (!table.occupiedByOrder) continue;
        const converted = await convertOccupiedOrderToOrder(table);
        activeOrders.push(converted);
      }

      await updateActiveOrdersStorage(activeOrders);
      setActiveTables(allTables);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    console.log(isFocused, 'isFocused');
    fetchData(); // Call the fetchData function
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
    await createNewOrder(table);
    // navigate(ScreenNames.NewOrderScreen, { tableName: table });
    navigate(ScreenNames.NewOrderScreen, { tableName: table.tableName });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HeaderBar headerTitle={strings.Tables}></HeaderBar>
      <View style={styles.container}>
        <View style={styles.scrollableTableContainer}>
          <ScrollView>
            <View style={styles.tableContainer}>
              {activeTables.map((table) => (
                <View style={styles.tableItem} key={table.id}>
                  <TableBox table={table} onPress={() => {}}></TableBox>
                </View>
              ))}
            </View>
          </ScrollView>
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
    // padding: 16,
    backgroundColor: '#2F2F2F',
  },
  scrollableTableContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '90%',
  },
  tableContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tableItem: {
    width: '33.33%',
    padding: 8,
    alignItems: 'center',
  },
  selectTableBtn: {
    backgroundColor: 'blue',
    borderRadius: 8,
    padding: 20,
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
