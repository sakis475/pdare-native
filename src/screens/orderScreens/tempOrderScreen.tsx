import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Keyboard, SafeAreaView } from 'react-native';

import { Divider, Portal } from 'react-native-paper';

import { colors } from '../../core/theme';

import { FlashList } from '@shopify/flash-list';
import { ScreenNames, navigate } from '../../navigation/AppNavigator';
import TableSelectBottomSheet from '../../components/bottomSheets/TableSelectBottomSheet';
import {
  createNewOrder,
  getTempOrder,
  setTableTempOrder,
} from '../../helpers/storage/orderStorage';
import { CatalogItemAdded } from '../../components/itemComponents/CatalogItemAdded';
import TempBottomOptions from '../../components/helpers/TempBottomOptions';
import { HeaderBar } from '../../components/helpers/HeaderBar';
import { strings } from '../../core/strings';
const TempOrderScreen = ({
  route,
  bottomSheetMode = false,
  isSheetOpen,
  onItemPress = () => {},
}: any) => {
  const [tableName, setTableName] = useState('');
  const [items, setItems] = useState<ItemReq[]>();
  const [refreshList, setRefreshList] = useState(false);

  const fetchItems = async () => {
    const tempOrder: Order = await getTempOrder();

    setTableName(tempOrder?.table?.tableName);
    setItems(tempOrder?.orderItems ?? []);
  };

  useEffect(() => {
    fetchItems();
  }, [route, isSheetOpen]);

  const handleSelectTable = async (table: Table) => {
    if (!items.length && table?.id) {
      await createNewOrder(table);
    }
    setTableName(table.tableName);
    setTableTempOrder(table);
  };

  const handleTempOrderPress = () => {
    navigate(ScreenNames.NewOrderScreen, { tableName: tableName });
  };

  //START TABLE MODAL LOGIC
  const bottomSheetRef = useRef<{ openModal: () => void; closeModal: () => void }>(null);

  const handleOpenModal = () => {
    bottomSheetRef.current?.openModal();
  };

  const handleCloseModal = () => {
    bottomSheetRef.current?.closeModal();
    Keyboard.dismiss();
  };

  const refreshTempList = async (updatedItems?: ItemReq[]) => {
    await fetchItems();
  };
  //END TABLE MODAL LOGIC

  const handleItemPress = (screenName: ScreenNames, props: any = null) => {
    navigate(screenName, props);
  };

  const renderItems = (item: ItemReq) => {
    return (
      <View style={{ marginVertical: 10 }}>
        {/* TODO: Create another component for showing added items, remove button, increment, on press open editItems etc.. */}
        <CatalogItemAdded
          item={item}
          refreshList={refreshTempList}
          onItemPress={() => onItemPress(item)}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {!bottomSheetMode ? <HeaderBar headerTitle={strings.NewOrder}></HeaderBar> : null}

      <View style={styles.container}>
        {items && items.length > 0 ? (
          <>
            <View style={styles.categoriesContainer}>
              <FlashList
                data={items}
                keyExtractor={(item) => {
                  const uniqueId = item.newItemId!;
                  return uniqueId;
                }}
                renderItem={({ item }) => renderItems(item)}
                estimatedItemSize={50}
                contentContainerStyle={styles.categoryFlashListContainer}
                showsVerticalScrollIndicator={true}
                persistentScrollbar={true}
                ItemSeparatorComponent={Divider}
              />
            </View>
          </>
        ) : items?.length === 0 ? (
          <>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={{ textAlign: 'center', color: '#ffffff' }}>
                Πατήστε το κουμπί «Προσθήκη»
              </Text>
              <Text style={{ textAlign: 'center', color: '#ffffff' }}>
                για να προσθέσετε καινούργια προϊόντα.
              </Text>
            </View>
          </>
        ) : (
          <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
        )}
        {!bottomSheetMode ? (
          <View>
            <TempBottomOptions
              tableName={tableName}
              handleOpenModal={handleOpenModal}
              handleTempOrderPress={handleTempOrderPress}
            />
            <Portal>
              <TableSelectBottomSheet ref={bottomSheetRef} handleSelectTable={handleSelectTable} />
            </Portal>
          </View>
        ) : null}
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
    flexGrow: 0, // Prevent FlatList from growing beyond the items it contains
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
});
export default TempOrderScreen;
