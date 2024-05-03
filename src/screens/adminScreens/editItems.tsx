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
const EditItemsScreen = ({ route }: any) => {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categorySet, setCategorySet] = useState<any>();
  const navigation = useNavigation();
  const [availableTables, setAvailableTables] = useState([]);
  const [focusedCategoryIndex, setFocusedCategoryIndex] = useState(0);
  const [loading, setLoading] = useState(false);
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
    console.log(groupedItems, 'grouped');
    // await setStorage('groupedItems', groupedItems);
    // await setStorage('categoriesIndexed', categoriesIndexed);

    // const groupedItems: any = await getStorage('groupedItems');
    // const categoriesIndexed: any = await getStorage('categoriesIndexed');
    const categories = groupedItems.map((e: any) => e.categoryTitle).filter((e: any) => e); //Object.keys(['cat1', 'cat2', 'cat3']);

    setCategorySet(categoriesIndexed);
    setCategories(categories);
    setItems(groupedItems);
  };
  //
  useEffect(() => {
    fetchItems();
  }, []);

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

  const deleteItem = async (item: Item) => {
    try {
      setLoading(true);
      await Requests.updateIsEnabled('/items/updateIsEnabled', {
        itemIds: [item.id],
        isEnabled: false,
      });

      const deletingItemIndex = items.findIndex((e) => e.id === item.id);
      if (deletingItemIndex) {
        console.log(deletingItemIndex, 'deletingItemIndex');
        const newItems = items;
        newItems[deletingItemIndex].isEnabled = false;
        setItems(newItems);
        setExtraData(!extraData);
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
        console.log(undeletingItemIndex, 'deletingItemIndex');
        const newItems = items;
        newItems[undeletingItemIndex].isEnabled = true;
        setItems(newItems);
        setExtraData(!extraData);
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
            onAction={(action: 'delete' | 'edit' | 'undelete') => {
              if (action === 'delete') {
                handleDelete(item);
              }
            }}
          />
          {placeDivider ? <Divider style={{ marginTop: 4 }} /> : null}
        </View>
      );
    } else {
      return <CategoryHeader title={item.categoryTitle} />;
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
          onAction={(action: 'delete' | 'edit' | 'undelete') => {
            if (action === 'delete') {
              handleDelete(item);
            } else if (action === 'undelete') {
              console.log('undelete pressed');
              handleUndelete(item);
            }
          }}
        />
        {placeDivider ? <Divider style={{ marginTop: 4 }} /> : null}
      </View>
    );
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

  const handleDeleteItem = (item: Item) => {};

  const [extraData, setExtraData] = useState(false);

  return (
    <View style={styles.container}>
      {categorySet && Object.keys(categorySet)?.length ? (
        <>
          <View style={{ flex: 1 }}>
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

            {loading && (
              <TouchableWithoutFeedback>
                {/* <View style={styles.overlay} /> */}
                <View style={styles.overlay}>
                  <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
                </View>
              </TouchableWithoutFeedback>
            )}
            <FlashList
              ref={flatListRef}
              data={items}
              renderItem={({ item, index }) => {
                if (item.isEnabled === false) {
                  return renderDeletedCategoryItem({
                    item,
                    placeDivider: !Object.values(categorySet).includes(index + 1),
                  });
                } else {
                  return renderCategoryItems({
                    item,
                    placeDivider: !Object.values(categorySet).includes(index + 1),
                  });
                }
              }}
              extraData={extraData}
              estimatedItemSize={200}
              onViewableItemsChanged={handleViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
            />

            <View style={styles.tableButtonContainer}>
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
export default EditItemsScreen;
