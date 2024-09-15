import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { colors } from '../../core/theme';
import { FlashList } from '@shopify/flash-list';
import { ScreenNames, navigate, navigateToDraft } from '../../navigation/AppNavigator';
import TableSelectBottomSheet from '../../components/bottomSheets/TableSelectBottomSheet';
import OrderBottomOptions from '../../components/helpers/OrderBottomOptions';
import {
  getTableTempOrder,
  reqFetchItems,
  setTableTempOrder,
} from '../../helpers/storage/orderStorage';

const NewOrderScreen = ({ route }: any) => {
  const [tableName, setTableName] = useState(route.params?.tableName);
  const [items, setItems] = useState<catGroupedItems>();
  const [categories, setCategories] = useState<string[]>([]);

  const fetchItems = async () => {
    const newOrder = await reqFetchItems();

    if (!newOrder) {
      return;
    }
    setItems(newOrder);

    if (!tableName) {
      const fetchTempTable = await getTableTempOrder();
      setTableName(fetchTempTable?.tableName);
    }

    const categories = Object.keys(newOrder);
    setCategories(categories);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSelectTable = (table: Table) => {
    setTableName(table.tableName);
    setTableTempOrder(table);
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

  const handleCategoryPress = (screenName: ScreenNames, props: any = null) => {
    navigate(screenName, props);
  };

  const handleTempOrderPress = () => {
    // navigate(ScreenNames.TempOrderScreen, {});
    navigateToDraft();
  };

  const renderCategories = (categoryTitle: string) => {
    return (
      <TouchableOpacity
        style={styles.categoryBox}
        onPress={() => {
          handleCategoryPress(ScreenNames.ItemListScreen, { tableName, categoryTitle });
        }}
      >
        <Text style={{ color: '#ffffff' }}>{categoryTitle}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {categories && Object.keys(categories)?.length ? (
        <>
          <View style={styles.categoriesContainer}>
            <FlashList
              data={categories}
              renderItem={({ item }) => renderCategories(item)}
              estimatedItemSize={20}
              contentContainerStyle={styles.categoryFlashListContainer}
              numColumns={3}
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
    paddingTop: 6,
    backgroundColor: '#2F2F2F',
    justifyContent: 'center',
    alignContent: 'center',
  },
  categoriesContainer: {
    // height: 50, // Set a fixed height for the container of the FlatList
    // backgroundColor: 'red',
    flex: 1,
    marginVertical: 16,
    marginHorizontal: 8,
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Adjust color and opacity as needed
  },
  categoryBox: {
    width: 100,
    height: 100,
    borderColor: '#fff',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    color: '#ffffff',
  },
  categoryFlashListContainer: { paddingHorizontal: 20 },
});
export default NewOrderScreen;
