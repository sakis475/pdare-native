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
} from 'react-native';
import { CatalogItem } from '../components/CatalogItem';
import { BottomHalfSheet } from '../components/BottomHalfSheet';
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
const SingleOrderScreen = ({ route }: any) => {
  const [tableName, setTableName] = useState(route.params.tableName);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categorySet, setCategorySet] = useState<any>();
  const navigation = useNavigation();

  const [focusedCategoryIndex, setFocusedCategoryIndex] = useState(0);

  /**
   * Show Dialog to cancel new order
   */

  function handleBackPress(navigation: NavigationProp<ReactNavigation.RootParamList>) {
    return AlertWithOptions(
      'Confirm Exit',
      'Are you sure you want to leave this screen?',
      () => navigation.goBack(),
      () => null
    );
  }

  useEffect(() => {
    // Add the custom back press handler
    BackHandler.addEventListener('hardwareBackPress', () => handleBackPress(navigation));

    // Cleanup the event listener
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => handleBackPress(navigation));
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderBackButton
          tintColor="white"
          pressColor="white"
          style={{ marginLeft: 0 }}
          onPress={() => handleBackPress(navigation)}
        />
      ),
    });
  }, [navigation]);

  /* END show dialog to cancel new order END */

  //mixed array of items and category headers
  function organizeItemsByCategory(items: any) {
    const itemsMix = [];
    let currentCategory = null;
    const categoryIndex: any = {};
    for (const item of items) {
      if (currentCategory !== item.category.title) {
        currentCategory = item.category.title;
        itemsMix.push({ categoryTitle: currentCategory });
        categoryIndex[currentCategory] = itemsMix.length - 1; //   . { categoryTitle: currentCategory, index: itemsMix.length - 1 };
      }
      itemsMix.push(item);
    }

    return [itemsMix, categoryIndex];
  }

  const fetchItems = async () => {
    const fetchItems: Item[] = await Requests.getRequest('/items');

    const [groupedItems, categoriesIndexed] = organizeItemsByCategory(fetchItems);
    // await setStorage('items', groupedItems);
    // await setStorage('categorySet', categorySet);

    // const groupedItems: any = await getStorage('items');
    // const categorySet: any = await getStorage('categorySet');
    const categories = groupedItems.map((e: any) => e.categoryTitle).filter((e: any) => e); //Object.keys(['cat1', 'cat2', 'cat3']);

    setCategorySet(categoriesIndexed);

    setCategories(categories);
    setItems(groupedItems);
  };
  //
  useEffect(() => {
    fetchItems();
  }, []);

  const [allTables, setAllTables]: any = useState([
    { key: '2', text: '2', occupiedBy: null },
    { key: '1', text: '1', occupiedBy: null },
    { key: '7', text: '7', occupiedBy: null },
    { key: '8', text: '8', occupiedBy: 1 },
    { key: '3', text: '3', occupiedBy: 4 },
    { key: '6', text: '6', occupiedBy: null },
    { key: '9', text: '9', occupiedBy: null },
    { key: '4', text: '4', occupiedBy: null },
    { key: '5', text: '5', occupiedBy: null },
    { key: '10', text: '10', occupiedBy: null },
  ]);

  const handleSelectTable = (table: any) => {
    setTableName(table);
  };

  const renderCategoryScroll = ({ item, index }: any) => {
    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          index === focusedCategoryIndex ? { backgroundColor: colors.primary } : null,
        ]}
        onPress={() => handleScrollToCategory(item)}
      >
        <Text style={styles.categoryText}>{item}</Text>
      </TouchableOpacity>
    );
  };

  const flatListRef = useRef(null);
  const categoryScrollRef = useRef(null);

  const handleScrollToCategory = (categoryTitle: any) => {
    //@ts-ignore
    flatListRef.current?.scrollToIndex({ index: categorySet[categoryTitle], animated: true });
  };

  const handleScrollOfCategoryScroll = (index: number) => {
    console.log(index);

    //@ts-ignore
    categoryScrollRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
    // }
  };

  useEffect(() => {
    handleScrollOfCategoryScroll(focusedCategoryIndex);
  }, [focusedCategoryIndex]);

  const CategoryHeader = memo(({ title }: any) => (
    <View
      style={{
        marginBottom: 10,
        backgroundColor: colors.darkerGrey,
        paddingVertical: 10,
      }}
    >
      <View
        style={{
          marginLeft: 16,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Icon name={'chevron-double-right'} size={20} color="#fff" />
        <Text style={{ fontSize: 26, fontWeight: 'bold', color: 'white' }}>{title}</Text>
      </View>
    </View>
  ));

  const renderCategoryItems = ({ item, placeDivider }: any) => {
    if (item.title) {
      return (
        <View style={{ marginBottom: 4, paddingHorizontal: 6 }}>
          <CatalogItem item={item} type="Use" />
          {placeDivider ? <Divider style={{ marginTop: 4 }} /> : null}
        </View>
      );
    } else {
      return <CategoryHeader title={item.categoryTitle} />;
    }
  };

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [300, 300], []);

  const handleOpenModal = () => {
    bottomSheetRef.current?.expand();
  };
  const handleCloseModal = () => {
    bottomSheetRef.current?.close();
  };

  const handleSheetChanges = (index: number) => {
    if (index === -1) {
      handleCloseModal();
    }
  };

  const handleViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems?.length) {
      const itemInView = viewableItems[0];
      if (itemInView.item?.categoryTitle) {
        setFocusedCategoryIndex(Object.keys(categorySet).indexOf(itemInView.item.categoryTitle));
      } else if (itemInView.item?.category?.title) {
        setFocusedCategoryIndex(Object.keys(categorySet).indexOf(itemInView.item.category.title));
      }
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 10, // Item needs to be 50% visible
  };

  return (
    <View style={styles.container}>
      {categorySet && Object.keys(categorySet)?.length ? (
        <>
          <View style={styles.categoriesContainer}>
            <FlatList
              ref={categoryScrollRef}
              data={categories}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              overScrollMode="never"
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => renderCategoryScroll({ item, index })}
              contentContainerStyle={styles.categoriesList}
              style={styles.categoriesFlatList}
              snapToAlignment={'center'}
            />
          </View>

          <FlashList
            ref={flatListRef}
            data={items}
            renderItem={({ item, index }) =>
              renderCategoryItems({
                item,
                placeDivider: !Object.values(categorySet).includes(index + 1),
              })
            }
            estimatedItemSize={200}
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
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
                allTables={allTables}
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
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Adjust color and opacity as needed
  },
});
export default SingleOrderScreen;
