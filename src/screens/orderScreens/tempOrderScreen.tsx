import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Keyboard, SafeAreaView } from 'react-native';

import { Divider, Portal } from 'react-native-paper';

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
          <TempBottomOptions
            table={table}
            handleOpenSelectTableModal={handleOpenSelectTableModal}
            handleTempOrderPress={handleTempOrderPress}
          />
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
});
export default TempOrderScreen;
