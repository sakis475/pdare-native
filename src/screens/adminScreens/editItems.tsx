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
const EditItemsScreen = ({ route }: any) => {
  const [items, setItems] = useState<Item[]>([]);
  const [reOrderItems, setReOrderItems] = useState([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categorySet, setCategorySet] = useState<any>();
  const navigation = useNavigation();
  const [focusedCategoryIndex, setFocusedCategoryIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState(true);
  const [rerenderItemList, setRerenderItemList] = useState(false);

  //mixed array of items and category headers

  useEffect(() => {
    fetchItems();
  }, []);

  /**
   * {<categoryTitle>: [item1,item2], ...}
   */
  function organizeItemsByCategory(items: any) {
    const itemsMix = [];
    let currentCategory = null;
    const categoryIndex: any = {};

    let categoryIdIncremental = 0;
    let tempOrder = 0;
    for (const item of items) {
      if (currentCategory !== item.category.title) {
        currentCategory = item.category.title;
        itemsMix.push({
          categoryTitle: currentCategory,
          categoryCurrentId: categoryIdIncremental,
          tempOrder,
        });
        categoryIdIncremental += 1;
        categoryIndex[currentCategory] = itemsMix.length - 1; //   . { categoryTitle: currentCategory, index: itemsMix.length - 1 };
        tempOrder += 1;
      }
      itemsMix.push({ ...item, tempOrder });
      tempOrder += 1;
    }

    return [itemsMix, categoryIndex];
  }

  const fetchItems = async () => {
    const fetchItems: Item[] = await Requests.getRequest('/items');

    const [groupedItems, categoriesIndexed] = organizeItemsByCategory(fetchItems);
    // await setStorage('groupedItems', groupedItems);
    // await setStorage('categoriesIndexed', categoriesIndexed);

    // const groupedItems: any = await getStorage('groupedItems');
    // const categoriesIndexed: any = await getStorage('categoriesIndexed');
    const categories = groupedItems.map((e: any) => e.categoryTitle).filter((e: any) => e); //Object.keys(['cat1', 'cat2', 'cat3']);

    setCategorySet(categoriesIndexed);
    setCategories(categories);
    setItems(groupedItems);
  };

  const triggerItemsListRerender = () => {
    setRerenderItemList(!rerenderItemList);
  };

  const renderCategoryMenu = ({ item, index }: any) => {
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

  const itemsListRef = useRef<any>(null);
  const categoryMenuRef = useRef<any>(null);

  const handleScrollToCategory = (categoryTitle: any) => {
    itemsListRef?.current?.scrollToIndex({ index: categorySet[categoryTitle], animated: true });
  };

  const handleScrollOfCategoryScroll = (index: number) => {
    categoryMenuRef?.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5, //focus to middle
    });
  };

  useEffect(() => {
    handleScrollOfCategoryScroll(focusedCategoryIndex);
  }, [focusedCategoryIndex]);

  const CategoryHeader = ({ category, sorting }: any) => (
    <View
      style={{
        marginBottom: 10,
        backgroundColor: colors.darkerGrey,
        paddingVertical: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
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
        <Text style={{ fontSize: 26, fontWeight: 'bold', color: 'white' }}>
          {category.categoryTitle}
        </Text>
      </View>
      {sorting ? (
        <View style={{ marginRight: 5 }}>
          <SortButtons
            handleSort={(direction: sortDirection) => {
              handleSortDirection(category, direction, true);
            }}
            disableUp={loading}
            disableDown={loading}
          ></SortButtons>
        </View>
      ) : null}
    </View>
  );

  const deleteItem = async (item: Item) => {
    try {
      setLoading(true);
      await Requests.updateIsEnabled('/items/updateIsEnabled', {
        itemIds: [item.id],
        isEnabled: false,
      });

      const deletingItemIndex = items.findIndex((e) => e.id === item.id);
      if (deletingItemIndex) {
        const newItems = items;
        newItems[deletingItemIndex].isEnabled = false;
        setItems(newItems);
        triggerItemsListRerender();
        toast('success', `Deleted ${item.title}`, undefined, 2000);
      }

      // fetchItems();
    } catch (error) {
      toast('error', 'Could not delete item');
    } finally {
      setLoading(false);
    }
  };

  const undeleteItem = async (item: Item) => {
    try {
      await Requests.updateIsEnabled('/items/updateIsEnabled', {
        itemIds: [item.id],
        isEnabled: true,
      });

      const undeletingItemIndex = items.findIndex((e) => e.id === item.id);
      if (undeletingItemIndex) {
        const newItems = items;
        newItems[undeletingItemIndex].isEnabled = true;
        setItems(newItems);
        triggerItemsListRerender();
        toast('success', `Un-deleted ${item.title}`, undefined, 2000);
      }

      // fetchItems();
    } catch (error) {
      toast('error', 'Could not delete item');
    }
  };

  const handleDelete = (item: Item) => {
    return AlertWithOptions(
      'Permanent Delete',
      `Are you sure you want to permanently delete item: \n\n *${item.title}*`,
      () => {
        deleteItem(item);
      },
      () => null,
      'Delete'
    );
  };

  const handleUndelete = (item: Item) => {
    undeleteItem(item);
  };

  const renderCategoryItems = ({ item, placeDivider }: any) => {
    if (item.title) {
      return (
        <View
          style={{
            marginBottom: 4,
            paddingHorizontal: 6,
          }}
        >
          <CatalogItem
            item={item}
            type="Manage"
            onAction={(action: onActionType) => {
              if (action === 'delete') {
                handleDelete(item);
              }
            }}
          />
          {placeDivider ? <Divider style={{ marginTop: 4 }} /> : null}
        </View>
      );
    } else {
      return <CategoryHeader category={item} />;
    }
  };

  const renderDeletedCategoryItem = ({ item, placeDivider }: any) => {
    return (
      <View
        style={{
          marginBottom: 4,
          paddingHorizontal: 6,
        }}
      >
        <CatalogItem
          item={item}
          type="Deleted"
          onAction={(action: onActionType) => {
            if (action === 'delete') {
              handleDelete(item);
            } else if (action === 'undelete') {
              handleUndelete(item);
            }
          }}
        />
        {placeDivider ? <Divider style={{ marginTop: 4 }} /> : null}
      </View>
    );
  };

  const renderSortingItem = ({ item, placeDivider, disableUp, disableDown }: any) => {
    return (
      <View
        style={{
          marginBottom: 4,
          paddingHorizontal: 6,
        }}
      >
        <CatalogItem
          item={item}
          type="Sort"
          onAction={(action: onActionType) => {
            if (action === 'sortDown') {
              handleSortDirection(item, 'sortDown');
            } else if (action === 'sortUp') {
              handleSortDirection(item, 'sortUp');
            }
          }}
        />
        {placeDivider ? <Divider style={{ marginTop: 4 }} /> : null}
      </View>
    );
  };

  const renderItemsList = ({ item, index }: any) => {
    if (item.isEnabled === false) {
      return renderDeletedCategoryItem({
        item,
        placeDivider: !Object.values(categorySet).includes(index + 1),
      });
    } else if (sorting === true) {
      if (item.title) {
        return renderSortingItem({
          item,
          placeDivider: !Object.values(categorySet).includes(index + 1),
        });
      } else {
        return <CategoryHeader category={item} sorting={true} />;
      }
    } else {
      return renderCategoryItems({
        item,
        placeDivider: !Object.values(categorySet).includes(index + 1),
      });
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
    itemVisiblePercentThreshold: 10,
  };

  const handleDeleteItem = (item: Item) => {};

  const handleSortBtn = () => {
    setLoading(true);
    setSorting(!sorting);
    triggerItemsListRerender();
    if (sorting) {
    } else {
    }
    setTimeout(() => {
      //give the illusion of entering sort mode
      setLoading(false);
    }, 500);
  };

  const handleReOrderList = (item: any, direction: sortDirection, isCategory?: boolean) => {
    console.log(JSON.stringify(items));
    const currentCategoryIndex = items.findIndex(
      (thisItem: any) => thisItem.categoryCurrentId === item.categoryCurrentId
    );

    let nextCategoryIndex = items.findIndex(
      (thisItem: any) =>
        thisItem.categoryCurrentId === item.categoryCurrentId + (direction === 'sortDown' ? 1 : -1)
    );

    let nextNextCategoryIndex = null;
    if (nextCategoryIndex !== -1) {
      nextNextCategoryIndex = items.findIndex(
        (thisItem: any) =>
          thisItem.categoryCurrentId ===
          item.categoryCurrentId + (direction === 'sortDown' ? 2 : -2)
      );
    }

    if (nextCategoryIndex === -1) {
      direction === 'sortDown' ? Infinity : -Infinity;
    }

    const itemsFirstPart = items.slice(currentCategoryIndex);

    triggerItemsListRerender();
  };

  const handleSortDirection = async (item: any, direction: sortDirection, isCategory?: boolean) => {
    // setLoading(true);

    // const updatedItems = await Requests.postRequest('/items/updateOrder', {
    //   itemId: item.id,
    //   sortDirection: direction,
    // });

    // console.log(updatedItems, 'updatedItems');

    // console.log(JSON.stringify(items));
    // items[item.category];
    // setItems()
    if (isCategory) {
    } else {
      console.log('isitem', direction);
    }
    handleReOrderList(item, direction, isCategory);
    // setLoading(false);
  };

  return (
    <View style={styles.container}>
      {categorySet && Object.keys(categorySet)?.length ? (
        <>
          <View style={{ flex: 1 }}>
            <View style={styles.categoriesContainer}>
              <FlatList
                ref={categoryMenuRef}
                data={categories}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                overScrollMode="never"
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => renderCategoryMenu({ item, index })}
                contentContainerStyle={styles.categoriesList}
                style={styles.categoriesFlatList}
                snapToAlignment={'center'}
              />
            </View>

            {loading && (
              <TouchableWithoutFeedback>
                <View style={styles.overlay}>
                  <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
                </View>
              </TouchableWithoutFeedback>
            )}
            <FlashList
              ref={itemsListRef}
              data={items}
              renderItem={({ item, index }) => renderItemsList({ item, index })}
              extraData={rerenderItemList}
              estimatedItemSize={200}
              onViewableItemsChanged={handleViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
            />

            <View style={styles.tableButtonContainer}>
              <View>
                <TouchableOpacity
                  style={[
                    styles.tableButton,
                    { backgroundColor: !sorting ? colors.grey : colors.primary },
                  ]}
                  onPress={handleSortBtn}
                >
                  <Icon name={'sort'} size={45} color="#fff" />
                </TouchableOpacity>
              </View>

              <View>
                <TouchableOpacity
                  style={styles.tableButton}
                  onPress={() => {
                    console.log('Handle New Item');
                  }}
                >
                  <Ionicons name={'add-circle-outline'} size={45} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
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

type onActionType = 'delete' | 'edit' | 'undelete' | sortDirection;
type sortDirection = 'sortDown' | 'sortUp';

export default EditItemsScreen;
