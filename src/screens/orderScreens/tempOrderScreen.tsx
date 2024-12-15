import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Keyboard } from 'react-native';
import { Divider, Portal, FAB } from 'react-native-paper';
import { colors } from '../../core/theme';
import { FlashList } from '@shopify/flash-list';
import { ScreenNames, navigate } from '../../navigation/navigationUtils';
import TableSelectBottomSheet from '../../components/bottomSheets/TableSelectBottomSheet';
import {
  createNewOrder,
  getTempOrder,
  markActiveItemForDelete,
  setTableTempOrder,
  updateTableOfOrder,
} from '../../helpers/storage/orderStorage';
import { CatalogItemAdded } from '../../components/itemComponents/CatalogItemAdded';
import TempBottomOptions from '../../components/helpers/TempBottomOptions';
import { HeaderBar } from '../../components/helpers/HeaderBar';
import { CatalogItemDisabled } from '../../components/itemComponents/CatalogItemDisabled';
import { useIsFocused } from '@react-navigation/native';
import { AlertWithOptions, toast } from '../../core/utils';
import { useStrings } from '../../core/localization/languageContext';
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
  const [headerSubtitle, setHeaderSubtitle] = useState('');

  const strings = useStrings();

  const fetchItems = async () => {
    const tempOrder: Order = await getTempOrder();
    setHeaderTitle(
      tempOrder?.orderItems?.[0]?.alreadySend ? strings.UPDATE_ORDER : strings.NEW_ORDER
    );

    setHeaderSubtitle(tempOrder?.table?.tableName ?? '');

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
        toast('success', strings.TABLE_CHANGE_SUCCESS);
      }
    }

    setTable(clearTable);
    setTableTempOrder(clearTable);
  };

  const handleTempOrderPress = async () => {
    const tempOrder: Order = await getTempOrder();

    table.occupiedByOrder = tempOrder;
    navigate(ScreenNames.NewOrderScreen, { table: table });
  };

  //START TABLE MODAL LOGIC
  const bottomSheetRef = useRef<{ openModal: () => void; closeModal: () => void }>(null);

  const handleOpenSelectTableModal = () => {
    if (table) {
      AlertWithOptions(
        strings.CHANGE_TABLE,
        strings.CHANGE_TABLE_CONFIRM,
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
    <View style={styles.mainContainer}>
      {!bottomSheetMode && <HeaderBar headerTitle={headerTitle} headerSubtitle={headerSubtitle} />}

      <View style={styles.contentContainer}>
        {items && items.length > 0 ? (
          <View style={styles.listContainer}>
            <FlashList
              data={items}
              keyExtractor={(item) => item.newItemId}
              renderItem={({ item }) => renderItems(item)}
              estimatedItemSize={50}
              contentContainerStyle={styles.categoryFlashListContainer}
              showsVerticalScrollIndicator={true}
              persistentScrollbar={true}
              ItemSeparatorComponent={Divider}
            />
          </View>
        ) : items?.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{strings.PRODUCTS_WILL_ADD}</Text>
            <Text style={styles.emptyText}>{strings.PRODUCTS_WILL_APPEAR_HERE}</Text>
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
          </View>
        )}
      </View>

      {!bottomSheetMode && (
        <>
          <View style={styles.bottomOptionsContainer}>
            <TempBottomOptions
              table={table}
              handleOpenSelectTableModal={handleOpenSelectTableModal}
              handleTempOrderPress={handleTempOrderPress}
            />
          </View>
          <Portal>
            <TableSelectBottomSheet ref={bottomSheetRef} handleSelectTable={handleSelectTable} />
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
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default TempOrderScreen;
