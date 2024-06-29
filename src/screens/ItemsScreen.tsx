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
import { CatalogItem } from '../components/CatalogItem';
import { SelectTable } from '../components/tableSelect/SelectTable';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Divider } from 'react-native-paper';
import * as Requests from '../helpers/requests';
import { getStorage, setStorage } from '../storage/store';
import { HeaderBackButton } from '@react-navigation/elements';
import { AlertWithOptions } from '../core/utils';
import ItemDetails from './ItemDetails';
import { colors } from '../core/theme';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { ScreenNames, navigate } from '../navigation/AppNavigator';
const ItemsScreen = ({ route }: any) => {
  const [tableName, setTableName] = useState(route.params.tableName);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const navigation = useNavigation();
  const [availableTables, setAvailableTables] = useState([]);
  const [focusedCategoryIndex, setFocusedCategoryIndex] = useState(0);

  const fetchItems = async () => {
    const fetchItems: Item[] = await Requests.getRequest('/items');

    const groupedByCategory = fetchItems.reduce((acc: any, item: any) => {
      const categoryTitle = item.category.title;
      if (!acc[categoryTitle]) {
        acc[categoryTitle] = [];
      }
      acc[categoryTitle].push(item);
      return acc;
    }, {});

    const categories = Object.keys(groupedByCategory);

    console.log(groupedByCategory);
    console.log(categories);
    setCategories(categories);
    setItems(groupedByCategory);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSelectTable = (table: any) => {
    setTableName(table);
  };

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [300, 300], []);

  const handleOpenModal = async () => {
    bottomSheetRef.current?.expand();
    const availTables = await getStorage('availableTables');
    setAvailableTables(availTables);
  };

  const handleCloseModal = () => {
    bottomSheetRef.current?.close();
    Keyboard.dismiss();
    setAvailableTables([]);
  };

  const handleSheetChanges = (index: number) => {
    if (index === -1) {
      handleCloseModal();
    }
  };

  const handleCategoryPress = (screenName: ScreenNames, props: any = null) => {
    navigate(screenName, props);
  };

  const renderCategories = (categoryTitle: string) => {
    return (
      <TouchableOpacity
        style={styles.categoryBox}
        onPress={() => {
          handleCategoryPress(ScreenNames.ProfileScreen);
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
          <FlashList
            data={categories}
            renderItem={({ item }) => renderCategories(item)}
            estimatedItemSize={20}
            contentContainerStyle={styles.categoryFlashListContainer}
            numColumns={3}
          />

          <View style={styles.tableButtonContainer}>
            <TouchableOpacity style={styles.tableButton} onPress={handleOpenModal}>
              <Text style={styles.buttonText}>{tableName}</Text>
            </TouchableOpacity>
          </View>
          <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            enablePanDownToClose={true}
            enableOverDrag={true}
            enableContentPanningGesture={false}
            backdropComponent={(backdropProps) => (
              <BottomSheetBackdrop
                {...backdropProps}
                enableTouchThrough={false}
                opacity={0.7}
                onPress={handleCloseModal}
              />
            )}
            handleIndicatorStyle={{ backgroundColor: '#fff' }}
            backgroundStyle={{ backgroundColor: colors.darkGrey }}
          >
            <BottomSheetView style={styles.tableChangeContainer}>
              <SelectTable
                allTables={availableTables}
                onTableSelect={(table: any) => {
                  handleCloseModal();
                  handleSelectTable(table);
                }}
              ></SelectTable>
            </BottomSheetView>
          </BottomSheet>
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
    marginBottom: 16,
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
export default ItemsScreen;
