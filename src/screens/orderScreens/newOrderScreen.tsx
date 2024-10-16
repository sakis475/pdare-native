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
  getTempOrder,
  setTableTempOrder,
  setTempOrder,
} from '../../helpers/storage/orderStorage';
import { getTextColorBasedOnLuminance } from '../../core/utils';
import { getStorage } from '../../storage/store';
import { storageInitData } from '../../helpers/storage/storageInit';

const NewOrderScreen = ({ route, navigation }: any) => {
  const [tableName, setTableName] = useState(route.params?.table?.tableName);
  const [categories, setCategories] = useState<Category[]>([]);

  const [headerTitle, setHeaderTitle] = useState('');

  const fetchItems = async () => {
    let newOrder = await getStorage('groupedItems');
    if (!newOrder) {
      await storageInitData();
    }

    newOrder = await getStorage('groupedItems');
    if (!newOrder) {
      return;
    }

    if (!tableName) {
      const fetchTempTable = await getTableTempOrder();
      setTableName(fetchTempTable?.tableName);
    }

    const categories = await getStorage('categories');
    setCategories(categories);

    const tempOrder = await getTempOrder();

    const newTitle = !!tempOrder?.orderItems?.[0]?.alreadySend
      ? 'Ενημέρωση Παραγγελίας'
      : 'Καινούργια Παραγγελία';

    setHeaderTitle(newTitle); // Update the title in state

    if (tempOrder?.table?.id !== route.params?.table?.id && route.params?.table?.occupiedByOrder) {
      await setTempOrder(route.params.table.occupiedByOrder);
    }
  };

  useEffect(() => {
    console.log(route.params?.table?.occupiedByOrder, 'new table!');
    fetchItems();
  }, [route.params?.table?.id]);

  useEffect(() => {
    if (navigation && headerTitle) {
      navigation.setOptions({
        headerTitle: headerTitle,
      });
    }
  }, [navigation, headerTitle]);

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

  const renderCategories = (category: Category) => {
    const textColor = getTextColorBasedOnLuminance(category.color ?? colors.darkGrey);
    return (
      <View style={styles.buttonContainer}>
        <View style={styles.shadowBox}></View>
        <TouchableOpacity
          style={[styles.categoryBox, { backgroundColor: category.color ?? colors.darkGrey }]}
          onPress={() => {
            handleCategoryPress(ScreenNames.ItemListScreen, {
              tableName,
              categoryTitle: category.title,
            });
          }}
          activeOpacity={0.7}
        >
          <Text style={{ color: textColor, fontWeight: 'bold' }}>{category.title}</Text>
        </TouchableOpacity>
      </View>
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
  buttonContainer: {
    width: 100,
    height: 110, // Slightly taller to include the shadow part
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 5,
  },
  shadowBox: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: colors.black, // Shadow color for 3D effect
    top: 9, // Offset to give depth
    left: 5,
    zIndex: 0, // Place behind the button
    borderRadius: 5, // Optional, if you want rounded corners
    // Optional shadow for additional depth (iOS only)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    // Android
    elevation: 8,
  },
  categoryBox: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    zIndex: 1, // Ensure the button is on top of the shadow
    borderRadius: 5, // Optional: rounded corners
    borderWidth: 1,
    borderColor: colors.black,

    // Sharper shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 2,

    // Sharp shadow for Android
    elevation: 10,
  },

  categoryFlashListContainer: { paddingHorizontal: 20 },
});
export default NewOrderScreen;
