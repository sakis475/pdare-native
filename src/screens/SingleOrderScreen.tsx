import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  BackHandler,
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
const SingleOrderScreen = ({ route }: any) => {
  const { tableName } = route.params;
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const navigation = useNavigation();

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

  const handleTablePress = () => {
    console.log('Button pressed!');
  };

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };
  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const groupItemsByCategory = (items: Item[]) => {
    return items.reduce((acc, item) => {
      const categoryTitle = item.category.title;
      if (!acc[categoryTitle]) {
        acc[categoryTitle] = [];
      }
      acc[categoryTitle].push(item);
      return acc;
    }, {} as any);
  };

  const fetchItems = async () => {
    const fetchItems: Item[] = await Requests.getRequest('/items');
    const groupedItems = groupItemsByCategory(fetchItems);
    const categories = Array.from(new Set(fetchItems.map((e) => e.category.title)));

    setCategories(categories);
    setItems(groupedItems);
  };

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

  const SelectTableComponent = (
    <SelectTable
      allTables={allTables}
      onTableSelect={(table: any) => {
        console.log(table);
        handleCloseModal();
        handleSelectTable(table);
      }}
    ></SelectTable>
  );

  const handleSelectTable = (table: any) => {
    //@ts-ignore
    navigation.navigate('singleOrder', { tableName: table });
  };

  const renderCategoryScroll = ({ item, index }: any) => {
    return (
      <TouchableOpacity style={styles.categoryItem} onPress={() => handleScrollToCategory(index)}>
        <Text style={styles.categoryText}>{item}</Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item, index, length }: { item: Item; index: number; length: number }) => {
    return (
      <View style={{ marginBottom: 4 }}>
        <CatalogItem item={item} type="Use" />
        {index !== length - 1 && <Divider style={{ marginTop: 4 }} />}
      </View>
    );
  };

  const flatListRef = useRef(null);

  const handleScrollToCategory = (index: number) => {
    //@ts-ignore
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const renderCategoryItems = ({ item, items }: any) => {
    const categoryItems = items[item];
    return (
      <View>
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
            <Text style={{ fontSize: 26, fontWeight: 'bold', color: 'white' }}>{item}</Text>
          </View>
        </View>
        <View style={{ paddingHorizontal: 16 }}>
          <FlatList
            data={categoryItems}
            keyExtractor={(subItem) => subItem.id.toString()}
            renderItem={({ item, index }) =>
              renderItem({
                item,
                index,
                length: categoryItems.length,
              })
            }
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 6,
      backgroundColor: '#2F2F2F',
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
      paddingHorizontal: categories.length > 3 ? 16 : 36,
      marginHorizontal: 2,
    },
    categoryText: {
      color: 'white',
      fontWeight: 'bold',
      margin: 0,
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
  });

  return (
    <View style={styles.container}>
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => renderCategoryScroll({ item, index })}
          contentContainerStyle={styles.categoriesList}
          style={styles.categoriesFlatList}
          overScrollMode="never"
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={Object.keys(items)}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => renderCategoryItems({ item, items: items })}
      />

      <View style={styles.tableButtonContainer}>
        <TouchableOpacity style={styles.tableButton} onPress={handleOpenModal}>
          <Text style={styles.buttonText}>{tableName}</Text>
        </TouchableOpacity>
      </View>
      <BottomHalfSheet
        showModal={isModalVisible}
        closeModal={handleCloseModal}
        component={SelectTableComponent}
        title={'Αλλαγή Τραπεζιού'}
      ></BottomHalfSheet>
    </View>
  );
};

export default SingleOrderScreen;
