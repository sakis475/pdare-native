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
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { CatalogItem } from '../../components/CatalogItem';
import { BottomHalfSheet } from '../../components/BottomHalfSheet';
import { SelectTable } from '../../components/tableSelect/SelectTable';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Divider } from 'react-native-paper';
import * as Requests from '../../helpers/requests';
import { getStorage, setStorage } from '../../storage/store';
import { HeaderBackButton } from '@react-navigation/elements';
import { AlertWithOptions } from '../../core/utils';
import ItemDetails from '../ItemDetails';
import { colors } from '../../core/theme';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { ScreenNames, navigate } from '../../navigation/AppNavigator';
import TableSelectBottomSheet from '../../components/tableSelect/TableSelectBottomSheet';
import OrderBottomOptions from '../../components/OrderBottomOptions';
import { reqFetchItems } from '../../helpers/newOrder';
const NewOrderScreen = ({ route }: any) => {
  const [tableName, setTableName] = useState(route.params?.tableName);
  const [items, setItems] = useState<catGroupedItems>();
  const [categories, setCategories] = useState<string[]>([]);
  const navigation = useNavigation();
  const [focusedCategoryIndex, setFocusedCategoryIndex] = useState(0);

  const fetchItems = async () => {
    const newOrder = await reqFetchItems();
    setItems(newOrder);

    const categories = Object.keys(newOrder);
    setCategories(categories);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSelectTable = (table: Table) => {
    setTableName(table.tableName);
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
    navigate(ScreenNames.TempOrderScreen, {});
  };

  const renderCategories = (categoryTitle: string) => {
    return (
      <TouchableOpacity
        style={styles.categoryBox}
        onPress={() => {
          handleCategoryPress(ScreenNames.ItemListScreen, categoryTitle);
        }}
      >
        <Text>{categoryTitle}</Text>
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
            tableName="Table 1"
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
    borderColor: 'fff',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryFlashListContainer: { paddingHorizontal: 20 },
});
export default NewOrderScreen;
