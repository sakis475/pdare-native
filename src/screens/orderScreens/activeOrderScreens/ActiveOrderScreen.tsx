import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Keyboard, SafeAreaView } from 'react-native';

import { Divider, Portal } from 'react-native-paper';

import { colors } from '../../../core/theme';

import { FlashList } from '@shopify/flash-list';
import TableSelectBottomSheet from '../../../components/bottomSheets/TableSelectBottomSheet';
import {
  createNewOrder,
  getTempOrder,
  markActiveItemForDelete,
  setTableTempOrder,
  setTempOrder,
  updateTableOfOrder,
} from '../../../helpers/storage/orderStorage';
import { CatalogItemAdded } from '../../../components/itemComponents/CatalogItemAdded';
import TempBottomOptions from '../../../components/helpers/TempBottomOptions';
import { CatalogItemDisabled } from '../../../components/itemComponents/CatalogItemDisabled';
import { AlertWithOptions, toast } from '../../../core/utils';
import { useNavigation } from '@react-navigation/native';
import CustomNavigationScreenHeaderTitle from '../../../components/basic/CustomNavigationScreenHeaderTitle';
import { navigate, navigateToDraft, ScreenNames } from '../../../navigation/navigationUtils';
import { useStrings } from '../../../core/localization/languageContext';
import { OrderInfoBar } from '../../../components/helpers/OrderInfoBar';
const ActiveOrderScreen = ({
  route,
  bottomSheetMode = false,
  isSheetOpen,
  onItemPress = () => {},
}: any) => {
  const [items, setItems] = useState<ItemReq[]>();
  const [table, setTable] = useState<Table>(route.params?.tableParam);
  const [order, setOrder] = useState<Order>(table.occupiedByOrder);
  const navigation = useNavigation();

  const strings = useStrings();

  const fetchItems = async () => {
    const tempOrder: Order = table.occupiedByOrder;
    setOrder(tempOrder);
    setItems(tempOrder?.orderItems ?? []);
  };

  useEffect(() => {
    fetchItems();
  }, [route, isSheetOpen]);

  const handleSelectTable = async (newTable: Table) => {
    const tempOrder: Order = await getTempOrder();

    if (table?.occupiedByOrder?.id) {
      //update existing order table
      const updatedOrder: Order = await updateTableOfOrder(table.occupiedByOrder, newTable);

      if (!updatedOrder?.id) {
        return;
      } else {
        newTable = updatedOrder.table;
        newTable.occupiedByOrder = updatedOrder;
        toast('success', strings.TABLE_CHANGE_SUCCESS);
      }
    }

    setTable(newTable);
    navigation.setOptions({
      headerTitle: () => <CustomNavigationScreenHeaderTitle title={newTable.tableName} />,
    });

    if (table.occupiedByOrder.id === tempOrder.id) {
      setTableTempOrder(newTable);
    }
  };

  const handleTempOrderPress = async () => {
    const tempOrder = await getTempOrder();
    if (tempOrder?.table && tempOrder?.table?.id !== table.id) {
      AlertWithOptions(
        strings.ONGOING_ORDER,
        strings.DISCARD_CHANGES_CONFIRM,
        () => {
          navigate(ScreenNames.NewOrderScreen, { table: table });
        },
        () => {}
      );
    } else {
      navigate(ScreenNames.NewOrderScreen, { table: table });
    }
  };

  const handleOnItemDelete = async (item: ItemReq) => {
    const tempOrder = await getTempOrder();
    if (tempOrder?.table && tempOrder?.table?.id !== table.id) {
      AlertWithOptions(
        strings.ONGOING_ORDER,
        strings.DISCARD_CHANGES_CONFIRM,
        async () => {
          // navigate(ScreenNames.NewOrderScreen, { table: table });
          await setTempOrder(table.occupiedByOrder);
          await markActiveItemForDelete(item);
          navigateToDraft();
        },
        () => {}
      );
    } else {
      await setTempOrder(table.occupiedByOrder);
      await markActiveItemForDelete(item);
      navigateToDraft();
    }
  };

  //START TABLE MODAL LOGIC
  const bottomSheetRef = useRef<{ openModal: () => void; closeModal: () => void }>(null);

  const handleOpenSelectTableModal = () => {
    AlertWithOptions(
      strings.CHANGE_TABLE,
      strings.CHANGE_TABLE_CONFIRM,
      () => {
        bottomSheetRef.current?.openModal();
      },
      () => {}
    );
  };

  const handleCloseModal = () => {
    bottomSheetRef.current?.closeModal();
    Keyboard.dismiss();
  };

  const refreshTempList = async (updatedItems?: ItemReq[]) => {
    await fetchItems();
  };
  //END TABLE MODAL LOGIC

  const renderItems = (item: ItemReq) => {
    return (
      <View style={{ marginVertical: 10 }}>
        {item.alreadySend === true ? (
          <CatalogItemDisabled
            item={item}
            refreshList={refreshTempList}
            onItemDelete={() => {
              handleOnItemDelete(item);
            }}
            preDisable={true}
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

  //This doesnt scroll to the bottom by default
  const listRef = useRef(null);
  const initialScrollComplete = useRef(false);

  const scrollToBottom = useCallback(() => {
    if (listRef.current && !initialScrollComplete.current) {
      listRef.current.scrollToEnd({ animated: false });
      initialScrollComplete.current = true;
    }
  }, []);

  useEffect(() => {
    // Reset the flag when data changes
    initialScrollComplete.current = false;
  }, [items]);

  const handleListLoad = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        {items && items.length > 0 ? (
          <>
            <View style={styles.categoriesContainer}>
              <OrderInfoBar
                order={order}
                containerStyle={{ paddingVertical: 20, paddingHorizontal: 15 }}
              ></OrderInfoBar>
              <FlashList
                ref={listRef}
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
                onLoad={handleListLoad}
              />
            </View>
          </>
        ) : items?.length === 0 ? (
          <>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={{ textAlign: 'center', color: '#ffffff' }}>
                {strings.PRODUCTS_WILL_APPEAR}
              </Text>
            </View>
          </>
        ) : (
          <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
        )}
        {!bottomSheetMode ? (
          <View style={{ marginBottom: 20 }}>
            <TempBottomOptions
              table={table}
              isTempOrder={false}
              handleOpenSelectTableModal={handleOpenSelectTableModal}
              handleTempOrderPress={handleTempOrderPress}
              overrideOrderView={true}
              couvertUpdated={(couvert) => {
                // Create a new order object with the updated couvert
                const updatedOrder = {
                  ...order,
                  couvert: couvert,
                };
                setOrder(updatedOrder);

                // Also update the table's order reference
                setTable((prevTable) => ({
                  ...prevTable,
                  occupiedByOrder: updatedOrder,
                }));
              }}
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
    paddingTop: 3,
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
  categoryFlashListContainer: {
    paddingHorizontal: 0,
    paddingBottom: 90,
  },
});
export default ActiveOrderScreen;
