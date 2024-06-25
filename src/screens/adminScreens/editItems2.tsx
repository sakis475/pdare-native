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
  TouchableWithoutFeedback,
} from 'react-native';
import { CatalogItem } from '../../components/CatalogItem';
import { BottomHalfSheet } from '../../components/BottomHalfSheet';
import { SelectTable } from '../../components/tableSelect/SelectTable';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Divider, FAB } from 'react-native-paper';
import * as Requests from '../../helpers/requests';
import { getStorage, setStorage } from '../../storage/store';
import { HeaderBackButton } from '@react-navigation/elements';
import { AlertWithOptions, toast } from '../../core/utils';
import ItemDetails from '../ItemDetails';
import { colors } from '../../core/theme';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { SortButtons } from '../../components/SortButtons';

export const EditItemsScreen2 = ({ route }: any) => {
  const [items, setItems] = useState<Item[]>([]);
  const [reOrderItems, setReOrderItems] = useState([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categorySet, setCategorySet] = useState<any>();
  const navigation = useNavigation();
  const [focusedCategoryIndex, setFocusedCategoryIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState(true);
  const [rerenderItemList, setRerenderItemList] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  function organizeItemsByCategory(items: any) {
    const category = [];
    let currentCategory = null;
    const categoryIndex: any = {};

    let categoryIdIncremental = 0;
    let tempOrder = 0;
    for (const item of items) {
      if (currentCategory !== item.category.title) {
        currentCategory = item.category.title;
        category.push({
          categoryTitle: currentCategory,
          categoryCurrentId: categoryIdIncremental,
          tempOrder,
        });
        categoryIdIncremental += 1;
        categoryIndex[currentCategory] = category.length - 1; //   . { categoryTitle: currentCategory, index: itemsMix.length - 1 };
        tempOrder += 1;
      }
      category.push({ ...item, tempOrder });
      tempOrder += 1;
    }

    return [category, categoryIndex];
  }

  const fetchItems = async () => {
    const fetchItems: Item[] = await Requests.getRequest('/items');

    const [groupedItems, categoriesIndexed] = organizeItemsByCategory(fetchItems);

    const categories = groupedItems.map((e: any) => e.categoryTitle).filter((e: any) => e);

    setCategorySet(categoriesIndexed);
    setCategories(categories);
    setItems(groupedItems);
  };

  return (
    <View style={styles.container}>
      <Text>asd</Text>
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
  overlay: {
    ...StyleSheet.absoluteFillObject, // Makes the overlay cover the entire parent View
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Grey color with transparency
    justifyContent: 'center',
    alignContent: 'center',
    zIndex: 2, // Makes sure the overlay is on top
    pointerEvents: 'auto',
  },
  categoriesContainer: {
    // height: 50, // Set a fixed height for the container of the FlatList
    // backgroundColor: 'red',
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
  tableButtonContainer: {
    justifyContent: 'space-between',
    paddingVertical: 2,
    paddingHorizontal: 10,
    backgroundColor: colors.darkerGrey,
    flexDirection: 'row',
  },
  tableButton: {
    // position: 'absolute',
    // right: 20,
    // bottom: 20,

    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'blue',
    borderWidth: 1,
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
});
