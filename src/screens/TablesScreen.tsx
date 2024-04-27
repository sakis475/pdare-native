import React, { useState, useEffect, useRef, useMemo } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TableBox } from '../components/tableSelect/TableBox';

import { getBearer } from '../helpers/requests';

import { strings } from '../core/strings';
import SingleOrderScreen from './SingleOrderScreen';
import { HeaderBar } from '../components/HeaderBar';
import { BottomHalfSheet } from '../components/BottomHalfSheet';
import { SelectTable } from '../components/tableSelect/SelectTable';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { colors } from '../core/theme';
const TablesScreen = () => {
  const [loading, setLoading] = useState(false);
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

  const [allTables, setAllTables]: any = useState([
    { key: '2', text: '2', occupiedBy: null },
    { key: '1', text: '1', occupiedBy: null },
    { key: '7', text: '7', occupiedBy: null },
    { key: '8', text: '8', occupiedBy: 1 },
    { key: '3', text: '3', occupiedBy: 4 },
    { key: '6', text: '6', occupiedBy: null },
    { key: '9', text: '9', occupiedBy: null },
    { key: '4', text: '4', occupiedBy: null },
    { key: '5', text: '5', occupiedBy: null },
    { key: '10', text: '10', occupiedBy: null },
  ]);

  const [selectedTable, setSelectedTable] = useState(null);
  const [activeTables, setActiveTables] = useState([
    { id: 1, tableName: 'Μπαλκόνι 24 ΕΞΟ', occupiedByOrder: 'order1' },
    { id: 2, tableName: 'A4', occupiedByOrder: 'order2' },
    { id: 3, tableName: 'B1', occupiedByOrder: 'order3' },
    { id: 4, tableName: 'B2', occupiedByOrder: 'order4' },
    { id: 5, tableName: 'B2', occupiedByOrder: 'order5' },
  ]);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [300, 300], []);

  const handleOpenModal = () => {
    bottomSheetRef.current?.expand();
  };
  const handleCloseModal = () => {
    bottomSheetRef.current?.close();
  };
  const handleSelectTable = (table: any) => {
    //@ts-ignore
    navigation.navigate('singleOrder', { tableName: table });
  };

  const SelectTableComponent = (
    <SelectTable
      allTables={allTables}
      onTableSelect={(table: any) => {
        console.log(table);
        handleCloseModal();
        handleSelectTable(table);
      }}
    ></SelectTable>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <HeaderBar headerTitle={strings.Tables}></HeaderBar>
      <View style={styles.container}>
        <View style={styles.scrollableTableContainer}>
          <ScrollView>
            <View style={styles.tableContainer}>
              {activeTables.map((table) => (
                <View style={styles.tableItem} key={table.id}>
                  <TableBox
                    table={table}
                    onPress={() => {
                      //@ts-ignore
                      // navigation.navigate('singleOrder');
                      navigation.navigate('singleOrder', { propName: 'A' });
                      // console.log(navigation);
                    }}
                  ></TableBox>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.selectTableBtn} onPress={handleOpenModal}>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{strings.NewOrderBtn}</Text>
        </TouchableOpacity>
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          // onChange={handleSheetChanges}
          enablePanDownToClose={true}
          enableOverDrag={true}
          enableContentPanningGesture={false}
          backdropComponent={(backdropProps) => (
            <BottomSheetBackdrop
              {...backdropProps}
              enableTouchThrough={false}
              opacity={0.7}
              onPress={handleCloseModal}
            />
          )}
          handleIndicatorStyle={{ backgroundColor: '#fff' }}
          backgroundStyle={{ backgroundColor: colors.darkGrey }}
        >
          <BottomSheetView style={styles.tableChangeContainer}>
            <SelectTable
              allTables={allTables}
              onTableSelect={(table: any) => {
                handleCloseModal();
                handleSelectTable(table);
              }}
            ></SelectTable>
          </BottomSheetView>
        </BottomSheet>
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
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Adjust color and opacity as needed
  },
});

export default TablesScreen;
