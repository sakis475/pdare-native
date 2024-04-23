import React, { useEffect, useLayoutEffect, useState } from 'react';
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
const SingleOrderScreen = ({ route }: any) => {
  const { tableName } = route.params;
  const [items, setItems]: any = useState([]);
  const [categories, setCategories]: any = useState([]);
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

  const fetchItems = async () => {
    const fetchItems = await Requests.getRequest('/items');
    const categories = Array.from(new Set(fetchItems.map((e: any) => e.category.title)));

    setCategories(categories);
    setItems(fetchItems);
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

  const renderItem = ({ item }: any) => (
    <View style={{ marginBottom: 4 }}>
      <CatalogItem item={item} type="Use" />
      <Divider style={{ marginTop: 4 }} />
    </View>
  );

  const renderCategoryItem = ({ item }: any) => {
    return (
      <TouchableOpacity style={styles.categoryItem}>
        <Text style={styles.categoryText}>{item}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderCategoryItem}
          contentContainerStyle={styles.categoriesList}
          style={styles.categoriesFlatList}
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.fixedButton} onPress={handleOpenModal}>
        <Text style={styles.buttonText}>{tableName}</Text>
      </TouchableOpacity>
      <BottomHalfSheet
        showModal={isModalVisible}
        closeModal={handleCloseModal}
        component={SelectTableComponent}
        title={'Αλλαγή Τραπεζιού'}
      ></BottomHalfSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#2F2F2F',
  },
  categoriesContainer: {
    // height: 50, // Set a fixed height for the container of the FlatList
    // backgroundColor: 'red',
    marginBottom: 16,
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
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 2,
  },
  categoryText: {
    color: 'white',
    fontWeight: 'bold',
    margin: 0,
  },
  fixedButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 80,
    height: 80,
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

export default SingleOrderScreen;
