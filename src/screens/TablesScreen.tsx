import React, { useState, useEffect, useRef, useMemo } from 'react';

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
import { useNavigation } from '@react-navigation/native';
import { TableBox } from '../components/helpers/TableBox';

import { strings } from '../core/strings';
import { HeaderBar } from '../components/helpers/HeaderBar';
import { SelectTable } from '../components/tableSelect/SelectTable';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { colors } from '../core/theme';
import * as Requests from '../helpers/requests';
import { Portal, PortalHost } from '@gorhom/portal';
import { createNewOrder, reqFetchItems } from '../helpers/orderStorage';
import TableSelectBottomSheet from '../components/bottomSheets/TableSelectBottomSheet';
import { ScreenNames, navigate, navigateToDraft } from '../navigation/AppNavigator';

const TablesScreen = () => {
  const [loading, setLoading] = useState(false);

  const [availableTables, setAvailableTables] = useState([]);
  const navigation = useNavigation();

  const fetchData = async () => {
    try {
      // const data = await getRequest("123");
      // if (data?.id) {
      //   console.log(data.id, "data.id");
      //   setReq(data);
      // }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData(); // Call the fetchData function
  }, []);

  const [selectedTable, setSelectedTable] = useState(null);
  const [activeTables, setActiveTables] = useState([
    { id: 1, tableName: 'TEST', occupiedByOrder: 'order1' },
    { id: 2, tableName: 'A4', occupiedByOrder: 'order2' },
    { id: 3, tableName: 'B1', occupiedByOrder: 'order3' },
    { id: 4, tableName: 'B2', occupiedByOrder: 'order4' },
    { id: 5, tableName: 'B2', occupiedByOrder: 'order5' },
  ]);

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
    await createNewOrder({ id: 1, isEnabled: true, tableName: 'A1A', tableOrder: 1 });
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
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{strings.NewOrderBtn}</Text>
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
