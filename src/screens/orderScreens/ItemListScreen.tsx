import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { View, StyleSheet, ActivityIndicator, Keyboard } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Divider } from 'react-native-paper';
import * as Requests from '../../helpers/requests';
import { getStorage, setStorage } from '../../storage/store';
import { colors } from '../../core/theme';
import { FlashList } from '@shopify/flash-list';
import { ScreenNames, navigate, navigateToDraft } from '../../navigation/AppNavigator';
import TableSelectBottomSheet from '../../components/bottomSheets/TableSelectBottomSheet';
import OrderBottomOptions from '../../components/helpers/OrderBottomOptions';
import { CategoryHeader } from '../../components/helpers/CategoryHeader';
import { CatalogItemAdd } from '../../components/itemComponents/CatalogItemAdd';
import { setTableTempOrder } from '../../helpers/storage/orderStorage';
const ItemListScreen = ({ route }: any) => {
  const [tableName, setTableName] = useState(route.params.tableName);
  const [categoryTitle, setCategoryTitle] = useState(route.params.categoryTitle);
  const [items, setItems] = useState<ItemReq[]>([]);

  const fetchItems = async () => {
    const fetchedItems: catGroupedItems = (await getStorage('groupedItems')) || {};

    const categoryItems = fetchedItems[categoryTitle];

    setItems(categoryItems);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSelectTable = (table: Table) => {
    setTableName(table.tableName);
    setTableTempOrder(table);
  };

  const handleTempOrderPress = () => {
    navigateToDraft();
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

  //END TABLE MODAL LOGIC

  const handleSheetChanges = (index: number) => {
    if (index === -1) {
      handleCloseModal();
    }
  };

  const handleItemPress = (screenName: ScreenNames, props: any = null) => {
    navigate(screenName, props);
  };

  const renderItems = (item: ItemReq, index: number) => {
    return (
      <View style={{ marginVertical: 8, paddingHorizontal: 0 }} key={index}>
        <CatalogItemAdd item={item} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {items?.length > 0 ? (
        <>
          <CategoryHeader title={items[0].category?.title} />

          <View style={styles.categoriesContainer}>
            <FlashList
              data={items}
              renderItem={({ item, index }) => renderItems(item, index)}
              estimatedItemSize={50}
              contentContainerStyle={styles.categoryFlashListContainer}
              ItemSeparatorComponent={Divider}
            />
          </View>
          <OrderBottomOptions
            tableName={tableName}
            handleOpenModal={handleOpenModal}
            handleTempOrderPress={handleTempOrderPress}
          />
          <TableSelectBottomSheet ref={bottomSheetRef} handleSelectTable={handleSelectTable} />
        </>
      ) : (
        <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#2F2F2F',
    justifyContent: 'center',
    alignContent: 'center',
  },
  categoryTitleHeader: {
    fontSize: 32,
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
  categoryFlashListContainer: { paddingHorizontal: 20 },
});
export default ItemListScreen;
