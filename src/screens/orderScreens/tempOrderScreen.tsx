import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Keyboard } from 'react-native';
import { Button, Divider, Portal } from 'react-native-paper';
import { colors } from '../../core/theme';
import { FlashList } from '@shopify/flash-list';
import { ScreenNames, navigate, navigateToTables } from '../../navigation/navigationUtils';
import TableSelectBottomSheet from '../../components/bottomSheets/TableSelectBottomSheet';
import {
  clearNewOrder,
  createNewOrder,
  getTempOrder,
  markActiveItemForDelete,
  setTableTempOrder,
  setTempOrder,
  updateTableOfOrder,
} from '../../helpers/storage/orderStorage';
import { CatalogItemAdded } from '../../components/itemComponents/CatalogItemAdded';
import TempBottomOptions from '../../components/helpers/TempBottomOptions';
import { HeaderBar } from '../../components/helpers/HeaderBar';
import { CatalogItemDisabled } from '../../components/itemComponents/CatalogItemDisabled';
import { toast } from '../../core/utils';
import { useStrings } from '../../core/localization/languageContext';
import { OrderInfoBar } from '../../components/helpers/OrderInfoBar';
import { LinearGradientFadeOut } from '../../components/basic/LinearGradientFadeOut';
import { EventEmitter, TEMP_ORDER_UPDATED } from '../../helpers/Sockets/EventEmitter';
import { LoadingOverlay } from '../../components/basic/SavingOverlay';
import MoreOptionsTempBottomSheet from '../../components/bottomSheets/MoreOptionsTempBottomSheet';
import { patchRequest, postRequest } from '../../helpers/requests';
import CustomButton from '../../components/basic/CustomButton';
import { ItemReq, Table, PrintLocation, PrintType } from '../../types/basic.types';

// Memoized Item renderer components
const DisabledItem = memo(({ item, onDelete }: { item: ItemReq; onDelete: any }) => (
  <CatalogItemDisabled item={item} onItemDelete={onDelete} />
));

const AddedItem = memo(
  ({ item, refreshList, onItemPress }: { item: ItemReq; refreshList: any; onItemPress: any }) => (
    <CatalogItemAdded item={item} refreshList={refreshList} onItemPress={onItemPress} />
  )
);

// Memoized OrderItem component
const OrderItem = memo(
  ({
    item,
    refreshTempList,
    onItemPress,
  }: {
    item: ItemReq;
    refreshTempList: any;
    onItemPress: any;
  }) => {
    const handleDelete = useCallback(async () => {
      await markActiveItemForDelete(item);
      refreshTempList();
    }, [item, refreshTempList]);

    const handlePress = useCallback(() => {
      onItemPress(item);
    }, [item, onItemPress]);

    return (
      <View style={[styles.itemContainer, item.markForDelete && styles.markedForDelete]}>
        {item.alreadySend ? (
          <DisabledItem item={item} onDelete={handleDelete} />
        ) : (
          <AddedItem item={item} refreshList={refreshTempList} onItemPress={handlePress} />
        )}
      </View>
    );
  }
);

const TempOrderScreen = ({
  currentIndex,
  route,
  bottomSheetMode = false,
  isSheetOpen,
  onItemPress = () => {},
}: any) => {
  const [orderState, setOrderState] = useState({
    table: null,
    items: [],
    order: null,
    headerTitle: '',
    headerSubtitle: '',
    isNewOrder: false,
  });
  const [isSending, setIsSending] = useState(false);

  const strings = useStrings();
  const bottomSheetRef = useRef(null);

  const fetchItems = useCallback(async () => {
    try {
      const tempOrder = await getTempOrder();
      setOrderState({
        table: tempOrder?.table,
        items: tempOrder?.orderItems ?? [],
        order: tempOrder,
        headerTitle: tempOrder?.orderItems?.[0]?.alreadySend
          ? strings.UPDATE_ORDER
          : strings.NEW_ORDER,
        headerSubtitle: tempOrder?.table?.tableName ?? '',
        isNewOrder: !tempOrder?.orderItems?.[0]?.alreadySend,
      });
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  }, [strings]);

  useEffect(() => {
    fetchItems();
    const subscription = EventEmitter.addListener(TEMP_ORDER_UPDATED, fetchItems);
    return () => subscription.remove();
  }, [fetchItems]);

  const handleSelectTable = useCallback(
    async (newTable: Table) => {
      try {
        const tempOrder = await getTempOrder();
        let clearTable = newTable;

        if (!orderState.items.length && newTable?.id) {
          const newOrder = await createNewOrder(newTable);
          clearTable = newOrder?.table;
        } else if (tempOrder.id) {
          const updatedOrder = await updateTableOfOrder(tempOrder, newTable);
          if (!updatedOrder?.id) return;
          toast('success', strings.TABLE_CHANGE_SUCCESS);
        }

        setOrderState((prev) => ({
          ...prev,
          table: clearTable,
        }));
        await setTableTempOrder(clearTable);
      } catch (error) {
        console.error('Error selecting table:', error);
      }
    },
    [orderState.items, strings]
  );

  const handleTempOrderPress = useCallback(async () => {
    const tempOrder = await getTempOrder();
    const tableWithOrder = {
      ...orderState.table,
      occupiedByOrder: tempOrder,
    };
    navigate(ScreenNames.NewOrderScreen, { table: tableWithOrder });
  }, [orderState.table]);

  const handleOpenSelectTableModal = useCallback(() => {
    bottomSheetRef.current?.openModal();
  }, [orderState.table, strings]);

  const handleCloseModal = useCallback(() => {
    bottomSheetRef.current?.closeModal();
    Keyboard.dismiss();
  }, []);

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
    const updatedOrder = {
      ...orderState.order,
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
          toast('success', `Added ${newQuantity} couvert(s)`, '', 1000);
          await fetchItems(); // Refresh data from storage
        }
      } catch (error) {
        toast('error', 'Failed to update couvert', '', 1000);
      }
    } else {
      await setTempOrder(updatedOrder);
    }

    setOrderState((prev) => ({
      ...prev,
      order: updatedOrder,
    }));
  };

  const handleCloseOrder = async () => {
    const orderId = orderState.order.id;

    try {
      setIsSending(true);
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
  const handleRePrintOrder = async (
    printLocation = PrintLocation.ALL,
    printType = PrintType.PERSONEL,
    isAnalysis = false
  ) => {
    const orderId = orderState.order.id;
    try {
      setIsSending(true);
      const data = { printType: printType, printLocation: printLocation, isAnalysis };
      const result = await postRequest(`/orders/orderPrint/${orderId}`, data);
      toast('success', strings.SUCCESS, '', 1000);
    } finally {
      setIsSending(false);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: ItemReq }) => (
      <OrderItem item={item} refreshTempList={fetchItems} onItemPress={onItemPress} />
    ),
    [fetchItems, onItemPress]
  );

  const keyExtractor = useCallback((item: ItemReq) => item.newItemId, []);

  if (!orderState.items) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {isSending && <LoadingOverlay />}

      {!bottomSheetMode && (
        <HeaderBar
          headerTitle={orderState.headerTitle}
          headerSubtitle={orderState.headerSubtitle}
        />
      )}

      <View style={styles.contentContainer}>
        <OrderInfoBar order={orderState.order} containerStyle={styles.orderInfoBar} />
        {orderState.items.length > 0 ? (
          <View style={styles.listContainer}>
            <FlashList
              data={orderState.items}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              estimatedItemSize={50}
              removeClippedSubviews={true}
              contentContainerStyle={styles.categoryFlashListContainer}
              showsVerticalScrollIndicator={true}
              persistentScrollbar={true}
              ItemSeparatorComponent={Divider}
            />
            <LinearGradientFadeOut height={150} />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            {orderState.table ? (
              <>
                <Text style={styles.emptyText}>{strings.PRODUCTS_WILL_ADD}</Text>
                <Text style={styles.emptyText}>{strings.PRODUCTS_WILL_APPEAR_HERE}</Text>
              </>
            ) : (
              <CustomButton
                onPress={() => handleOpenSelectTableModal()}
                style={{ paddingHorizontal: 50 }}
              >
                <Text>{strings.SELECT_TABLE}</Text>
              </CustomButton>
            )}
          </View>
        )}
      </View>

      {!bottomSheetMode && (
        <>
          <View style={styles.bottomOptionsContainer}>
            <TempBottomOptions
              table={orderState.table}
              isTempOrder={true}
              handleOpenSelectTableModal={handleOpenSelectTableModal}
              handleTempOrderPress={handleTempOrderPress}
              couvertUpdated={fetchItems}
              isSending={isSending}
              setIsSending={setIsSending}
              handleOpenMoreOptionsModal={handleMoreOptionsOpenModal}
            />
          </View>
          <Portal>
            <TableSelectBottomSheet ref={bottomSheetRef} handleSelectTable={handleSelectTable} />
          </Portal>
          <Portal>
            <MoreOptionsTempBottomSheet
              ref={moreOptionsBottomSheetRef}
              order={orderState.order}
              onChangeTable={handleOpenSelectTableModal}
              onChangeCouvert={handleChangeCouvert}
              onCloseOrder={handleCloseOrder}
              onPrint={handleRePrintOrder}
              onCustomerAnalysis={() => handleRePrintOrder(undefined, PrintType.FINAL, true)}
            ></MoreOptionsTempBottomSheet>
          </Portal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#2F2F2F',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#2F2F2F',
  },
  listContainer: {
    flex: 1,
    paddingTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#ffffff',
  },
  categoryFlashListContainer: {
    paddingHorizontal: 0,
    paddingBottom: 140,
  },
  bottomOptionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  itemContainer: {
    backgroundColor: 'transparent',
  },
  markedForDelete: {
    backgroundColor: colors.lightRed,
  },
  orderInfoBar: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: colors.grey,
    fontSize: 16,
  },
});

export default memo(TempOrderScreen);
