import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Keyboard, SafeAreaView } from 'react-native';

import { Divider, Portal } from 'react-native-paper';

import { colors } from '../../../core/theme';

import { FlashList } from '@shopify/flash-list';
import TableSelectBottomSheet from '../../../components/bottomSheets/TableSelectBottomSheet';
import {
  clearNewOrder,
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
import {
  navigate,
  navigateToDraft,
  navigateToTables,
  ScreenNames,
} from '../../../navigation/navigationUtils';
import { useStrings } from '../../../core/localization/languageContext';
import { OrderInfoBar } from '../../../components/helpers/OrderInfoBar';
import { CatalogItemViewOnly } from '../../../components/itemComponents/CatalogItemViewOnly';
import { LinearGradientFadeOut } from '../../../components/basic/LinearGradientFadeOut';
import MoreOptionsTempBottomSheet from '../../../components/bottomSheets/MoreOptionsTempBottomSheet';
import { patchRequest, postRequest } from '../../../helpers/requests';
import { LoadingOverlay } from '../../../components/basic/SavingOverlay';
import { ItemReq, Table, Order, PrintLocation, PrintType } from '../../../types/basic.types';
const ActiveOrderScreen = ({
  route,
  bottomSheetMode = false,
  isSheetOpen,
  onItemPress = () => {},
}: any) => {
  const [items, setItems] = useState<ItemReq[]>();
  const [table, setTable] = useState<Table>(route.params?.tableParam);
  const [order, setOrder] = useState<Order>(table.occupiedByOrder);

  const [isSending, setIsSending] = useState(false);

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
      const updatedOrder: Order = await updateTableOfOrder(table.occupiedByOrder, newTable);

      if (!updatedOrder?.id) {
        return;
      } else {
        newTable.occupiedByOrder = updatedOrder;
        newTable = updatedOrder.table;
        toast('success', strings.TABLE_CHANGE_SUCCESS);
      }
    }

    setTable(newTable);
    navigation.setOptions({
      headerTitle: () => <CustomNavigationScreenHeaderTitle title={newTable.tableName} />,
    });

    if (table?.occupiedByOrder?.id === tempOrder?.id) {
      setTableTempOrder(newTable);
    }
  };

  const handleCloseOrder = async () => {
    try {
      setIsSending(true);
      const orderId = order.id;

      const result = await patchRequest(`/orders/close/${orderId}`);
      if (result?.success === true) {
        if (orderId === (await getTempOrder())?.id) {
          await clearNewOrder();
        }
        toast('success', strings.CLOSED_AT, '', 1000);
        navigateToTables();
      }
    } finally {
      setIsSending(false);
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

  //START COMMENT MODAL LOGIC
  const moreOptionsBottomSheetRef = useRef<{ openModal: () => void; closeModal: () => void }>(null);

  const handleMoreOptionsOpenModal = () => {
    moreOptionsBottomSheetRef.current?.openModal();
  };

  const handleMoreOptionsCloseModal = () => {
    moreOptionsBottomSheetRef.current?.closeModal();
    Keyboard.dismiss();
  };

  //END COMMENT MODAL LOGIC

  const handleChangeCouvert = async (newQuantity: number) => {
    const tempOrder: Order = await getTempOrder();

    if (table?.occupiedByOrder?.id === tempOrder?.id) {
      await setTempOrder({ ...tempOrder, couvert: newQuantity });
    }

    const updatedOrder = {
      ...order,
      couvert: newQuantity,
    };

    //In case of existing order
    if (updatedOrder.id) {
      const newReqOrder = {
        couvert: newQuantity,
        table: updatedOrder.table.id,
        orderId: updatedOrder.id,
        items: [] as any,
      };

      try {
        const result = await patchRequest(`/orders/${updatedOrder.id}`, newReqOrder);
        if (result?.id) {
          setOrder((prev) => ({
            ...prev,
            couvert: newQuantity,
          }));
          setTable((prevTable) => ({
            ...prevTable,
            occupiedByOrder: updatedOrder,
          }));
          toast('success', `Added ${newQuantity} couvert(s)`, '', 1000);
        }
      } catch (error) {
        toast('error', 'Failed to update couvert', '', 1000);
      }
    }
  };

  const renderItems = (item: ItemReq) => {
    return (
      <View>
        {order.closedAt ? (
          <CatalogItemViewOnly item={item}></CatalogItemViewOnly>
        ) : item.alreadySend === true ? (
          <CatalogItemDisabled
            item={item}
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

  const handleRePrintOrder = async (
    printLocation = PrintLocation.ALL,
    printType = PrintType.PERSONEL,
    isAnalysis = false
  ) => {
    const orderId = order.id;
    try {
      setIsSending(true);
      const data = { printType: printType, printLocation: printLocation, isAnalysis };
      const result = await postRequest(`/orders/orderPrint/${orderId}`, data);
      toast('success', strings.SUCCESS, '', 1000);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {isSending && <LoadingOverlay />}
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
              <LinearGradientFadeOut />
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
              }}
              handleOpenMoreOptionsModal={handleMoreOptionsOpenModal}
            />
            <Portal>
              <TableSelectBottomSheet ref={bottomSheetRef} handleSelectTable={handleSelectTable} />
            </Portal>
            <Portal>
              <MoreOptionsTempBottomSheet
                ref={moreOptionsBottomSheetRef}
                order={order}
                onChangeTable={handleOpenSelectTableModal}
                onChangeCouvert={handleChangeCouvert}
                onCloseOrder={handleCloseOrder}
                onPrint={handleRePrintOrder}
                onCustomerAnalysis={() => handleRePrintOrder(undefined, PrintType.FINAL, true)}
              ></MoreOptionsTempBottomSheet>
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
