import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Keyboard, SafeAreaView } from 'react-native';

import { Divider, Portal } from 'react-native-paper';

import { colors } from '../../core/theme';

import { FlashList } from '@shopify/flash-list';
import { ScreenNames, navigate } from '../../navigation/AppNavigator';
import TableSelectBottomSheet from '../../components/bottomSheets/TableSelectBottomSheet';
import {
  convertNewOrderToRequestObject,
  createNewOrder,
  getTempOrder,
  markActiveItemForDelete,
  setTableTempOrder,
  updateTableOfOrder,
} from '../../helpers/storage/orderStorage';
import { CatalogItemAdded } from '../../components/itemComponents/CatalogItemAdded';
import TempBottomOptions from '../../components/helpers/TempBottomOptions';
import { HeaderBar } from '../../components/helpers/HeaderBar';
import { strings } from '../../core/strings';
import { CatalogItemDisabled } from '../../components/itemComponents/CatalogItemDisabled';
import { useIsFocused } from '@react-navigation/native';
import { AlertWithOptions, toast } from '../../core/utils';
import { patchRequest } from '../../helpers/requests';
const TempOrderScreen = ({
  currentIndex,
  route,
  bottomSheetMode = false,
  isSheetOpen,
  onItemPress = () => {},
}: any) => {
  const [table, setTable] = useState<Table>();
  const [items, setItems] = useState<ItemReq[]>();
  const [headerTitle, setHeaderTitle] = useState('');

  const fetchItems = async () => {
    const tempOrder: Order = await getTempOrder();
    setHeaderTitle(
      tempOrder?.orderItems?.[0]?.alreadySend ? 'Ενημέρωση παραγγελίας' : 'Καινούργια Παραγγελία'
    );

    setTable(tempOrder?.table);
    setItems(tempOrder?.orderItems ?? []);
  };
  const isFocused = useIsFocused();
  useEffect(() => {
    if (currentIndex && currentIndex !== 1) return;
    fetchItems();
  }, [route, isSheetOpen, isFocused, currentIndex]);

  const handleSelectTable = async (newTable: Table) => {
    const tempOrder: Order = await getTempOrder();
    let clearTable = newTable;

    //In Case of new order start a new order
    if (!items.length && newTable?.id) {
      clearTable = (await createNewOrder(newTable))?.table;
    } else if (tempOrder.id) {
      //update existing order table
      const updatedOrder = await updateTableOfOrder(tempOrder, newTable);
      if (!updatedOrder?.id) {
        return;
      } else {
        toast('success', 'Επιτυχία Αλλαγής Τραπεζιού');
      }
    }

    setTable(clearTable);
    setTableTempOrder(clearTable);
  };

  const handleTempOrderPress = () => {
    navigate(ScreenNames.NewOrderScreen, { table: table });
  };

  //START TABLE MODAL LOGIC
  const bottomSheetRef = useRef<{ openModal: () => void; closeModal: () => void }>(null);

  const handleOpenSelectTableModal = () => {
    if (table) {
      AlertWithOptions(
        'Αλλαγή Τραπεζιού',
        'Είστε σίγουροι ότι θέλετε να αλλάξετε τραπέζι;',
        () => {
          bottomSheetRef.current?.openModal();
        },
        () => {}
      );
    } else {
      bottomSheetRef.current?.openModal();
    }
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
      <View
        style={{
          marginVertical: 10,
          paddingVertical: 5,
          backgroundColor: item.markForDelete ? colors.lightRed : null,
        }}
      >
        {item.alreadySend === true ? (
          <CatalogItemDisabled
            item={item}
            refreshList={refreshTempList}
            onItemDelete={async (item: ItemReq) => {
              await markActiveItemForDelete(item);
              refreshTempList();
            }}
          />
        ) : (
          <CatalogItemAdded
            item={item}
            refreshList={refreshTempList}
            onItemPress={() => onItemPress(item)}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {!bottomSheetMode ? <HeaderBar headerTitle={headerTitle}></HeaderBar> : null}

      <View style={styles.container}>
        {items && items.length > 0 ? (
          <>
            <View style={styles.categoriesContainer}>
              <FlashList
                data={items}
                keyExtractor={(item) => {
                  const uniqueId = item.newItemId;
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
                Προϊόντα που θα προσθέσετε
              </Text>
              <Text style={{ textAlign: 'center', color: '#ffffff' }}>θα εμφανιστούν εδώ.</Text>
            </View>
          </>
        ) : (
          <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
        )}
        {!bottomSheetMode ? (
          <View>
            <TempBottomOptions
              table={table}
              handleOpenSelectTableModal={handleOpenSelectTableModal}
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
