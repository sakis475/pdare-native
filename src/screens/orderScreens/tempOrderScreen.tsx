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
import { NavigationProp, useIsFocused, useNavigation } from '@react-navigation/native';
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
import { getTempOrder } from '../../helpers/newOrder';
import OrderBottomOptions from '../../components/OrderBottomOptions';
import { CatalogItemAdded } from '../../components/itemListOptionsBtns/CatalogItemAdded';
import TempBottomOptions from '../../components/TempBottomOptions';
const TempOrderScreen = ({ route }: any) => {
  const [tableName, setTableName] = useState('');
  const [items, setItems] = useState<ItemReq[]>();
  const [refreshList, setRefreshList] = useState(false);
  const isFocused = useIsFocused();

  const fetchItems = async () => {
    const tempOrder: NewOrder = await getTempOrder();
    console.log('tempOrders', tempOrder, 'tempOrders');
    setTableName(tempOrder?.table?.tableName);
    setItems(tempOrder?.items);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchItems();
    }
  }, [isFocused]);

  const handleSelectTable = (table: any) => {
    setTableName(table);
  };

  const handleTempOrderPress = () => {
    navigate(ScreenNames.NewOrderScreen, {});
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

  const refreshTempList = async (updatedItems?: ItemReq[]) => {
    await fetchItems();
  };
  //END TABLE MODAL LOGIC

  const handleItemPress = (screenName: ScreenNames, props: any = null) => {
    navigate(screenName, props);
  };

  const renderItems = (item: ItemReq) => {
    return (
      <View>
        {/* TODO: Create another component for showing added items, remove button, increment, on press open editItems etc.. */}
        <CatalogItemAdded item={item} itemRemoved={refreshTempList} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {items && items.length > 0 ? (
        <>
          <View style={styles.categoriesContainer}>
            <FlashList
              // key={refreshList ? 'refresh-true' : 'refresh-false'}
              data={items}
              keyExtractor={(item) => item.newItemId!.toString()}
              renderItem={({ item }) => renderItems(item)}
              estimatedItemSize={50}
              contentContainerStyle={styles.categoryFlashListContainer}
              showsVerticalScrollIndicator={true}
              persistentScrollbar={true}
              // extraData={refreshList}
            />
          </View>
          <TempBottomOptions
            tableName="Table 1"
            handleOpenModal={handleOpenModal}
            handleTempOrderPress={handleTempOrderPress}
          />

          <TableSelectBottomSheet ref={bottomSheetRef} handleSelectTable={handleSelectTable} />
        </>
      ) : items ? (
        <>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={{ textAlign: 'center' }}>Δεν έχετε προσθέσει προιόντα.</Text>
          </View>
          <TempBottomOptions
            tableName="Table 1"
            handleOpenModal={handleOpenModal}
            handleTempOrderPress={handleTempOrderPress}
          />
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
    paddingTop: 20,
    backgroundColor: '#2F2F2F',
    justifyContent: 'center',
    alignContent: 'center',
    paddingHorizontal: 0,
  },
  categoriesContainer: {
    // height: 50, // Set a fixed height for the container of the FlatList
    // backgroundColor: 'red',
    flex: 1,
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
  categoryFlashListContainer: { paddingHorizontal: 0 },
});
export default TempOrderScreen;
