import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Keyboard, Text } from 'react-native';
import { Divider } from 'react-native-paper';
import { getStorage } from '../../storage/store';
import { colors } from '../../core/theme';
import { FlashList } from '@shopify/flash-list';
import {
  ScreenNames,
  navigate,
  navigateToDraft,
  navigateWithReset,
} from '../../navigation/navigationUtils';
import TableSelectBottomSheet from '../../components/bottomSheets/TableSelectBottomSheet';
import OrderBottomOptions from '../../components/helpers/OrderBottomOptions';
import { CategoryHeader } from '../../components/helpers/CategoryHeader';
import { CatalogItemAdd } from '../../components/itemComponents/CatalogItemAdd';
import { addNewItemToTemp, setTableTempOrder } from '../../helpers/storage/orderStorage';
import { useStrings } from '../../core/localization/languageContext';
import { useIsFocused } from '@react-navigation/native';
import { ItemReq, Table, User, catGroupedItems } from '../../types/basic.types';
import { TableIO } from '../../types/io.types';
import GlobalStore from '../../storage/GlobalStore';
import CustomButton from '../../components/basic/CustomButton';
// Memoized components
const MemoizedDivider = memo(Divider);
const MemoizedCatalogItemAdd = memo(CatalogItemAdd);

const ItemListScreen = ({ route }: any) => {
  const [tableName, setTableName] = useState(route.params.tableName);
  const [categoryTitle, setCategoryTitle] = useState(route.params.categoryTitle);
  const [items, setItems] = useState<ItemReq[]>(null);
  const [duplicateItemIds, setDuplicateItemIds] = useState<Set<number>>(new Set());

  const isFocused = useIsFocused();
  const strings = useStrings();
  const bottomSheetRef = useRef<{ openModal: () => void; closeModal: () => void }>(null);

  const [currentUser, setCurrentUser] = useState<User>(null);

  // Memoized handlers
  const handleSelectTable = useCallback((table: Table) => {
    setTableName(table.tableName);
    setTableTempOrder(table);
  }, []);

  const handleTempOrderPress = useCallback(() => {
    navigateToDraft();
  }, []);

  const handleOpenModal = useCallback(() => {
    bottomSheetRef.current?.openModal();
  }, []);

  const handleCloseModal = useCallback(() => {
    bottomSheetRef.current?.closeModal();
    Keyboard.dismiss();
  }, []);

  const handleAddNewItemPress = useCallback(async (item: ItemReq) => {
    await addNewItemToTemp(item);
  }, []);

  // Optimized fetch function
  const fetchItems = useCallback(async () => {
    if (!categoryTitle) return;

    try {
      const fetchedItems: catGroupedItems = await getStorage('groupedItems');
      if (fetchedItems) {
        setItems(fetchedItems[categoryTitle] ?? []);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      setItems([]);
    }

    try {
      const currentUser = JSON.parse(GlobalStore?.getInstance()?.getValue('currentUser'));
      setCurrentUser(currentUser);
    } catch {}
  }, [categoryTitle]);

  useEffect(() => {
    setCategoryTitle(route.params.categoryTitle);
  }, [route.params.categoryTitle]);

  useEffect(() => {
    if (isFocused) {
      fetchItems();
    }
  }, [isFocused, fetchItems]);

  // Memoized render item function
  const renderItem = useCallback(
    ({ item, index }: { item: ItemReq; index: number }) => (
      <MemoizedCatalogItemAdd
        item={item}
        handleAddNewItemPress={handleAddNewItemPress}
        disableInstantAdd={duplicateItemIds.has(item.id)}
      />
    ),
    [duplicateItemIds, handleAddNewItemPress]
  );

  // Memoized key extractor
  const keyExtractor = useCallback((item: ItemReq) => item.id.toString(), []);

  if (!items) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text
            style={{
              color: colors.white,
              textAlign: 'center',
            }}
          >
            {strings.NO_PRODUCTS_FOUND}
          </Text>

          {currentUser?.role === 'owner' && (
            <CustomButton
              onPress={() => {
                navigateWithReset([
                  ScreenNames.MainTabs,
                  { name: ScreenNames.ManageItemsScreen, params: { categoryTitle: categoryTitle } },
                ]);
              }}
              style={{ width: '60%' }}
            >
              <Text>{strings.CREATE_PRODUCT}</Text>
            </CustomButton>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CategoryHeader title={items[0].category?.title} />

      <View style={styles.categoriesContainer}>
        <FlashList
          data={items}
          renderItem={renderItem}
          estimatedItemSize={50}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.categoryFlashListContainer}
          ItemSeparatorComponent={MemoizedDivider}
          overrideItemLayout={(layout, item) => {
            layout.size = 50;
          }}
          drawDistance={100}
          estimatedListSize={{ height: 500, width: 500 }}
        />
      </View>

      <OrderBottomOptions
        tableName={tableName}
        handleOpenModal={handleOpenModal}
        handleTempOrderPress={handleTempOrderPress}
      />

      <TableSelectBottomSheet ref={bottomSheetRef} handleSelectTable={handleSelectTable} />
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: colors.white,
    textAlign: 'center',
  },
});
export default memo(ItemListScreen);
