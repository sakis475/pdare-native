import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Dimensions,
} from 'react-native';
import { colors } from '../../core/theme';
import { FlashList } from '@shopify/flash-list';
import { ScreenNames, navigate, navigateToDraft } from '../../navigation/navigationUtils';
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
import { useStrings } from '../../core/localization/languageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_COUNT = 4;
const MARGIN = 1;
const BOX_SIZE = (SCREEN_WIDTH - MARGIN * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

const NewOrderScreen = ({ route, navigation }: any) => {
  const [tableName, setTableName] = useState(route.params?.table?.tableName);
  const [categories, setCategories] = useState<Category[]>([]);

  const [headerTitle, setHeaderTitle] = useState('');

  const strings = useStrings();

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
      ? strings.UPDATE_ORDER
      : strings.NEW_ORDER;

    setHeaderTitle(newTitle); // Update the title in state

    if (tempOrder?.table?.id !== route.params?.table?.id && route.params?.table?.occupiedByOrder) {
      await setTempOrder(route.params.table.occupiedByOrder);
    }
  };

  useEffect(() => {
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

  const renderCategories = ({ item: category }: { item: Category }) => {
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
          <Text style={[styles.categoryText, { color: textColor }]}>{category.title}</Text>
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
              renderItem={renderCategories}
              estimatedItemSize={BOX_SIZE}
              contentContainerStyle={styles.categoryFlashListContainer}
              numColumns={COLUMN_COUNT}
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
    paddingTop: 10,
    flex: 1,
    backgroundColor: '#2F2F2F',
  },
  categoriesContainer: {
    flex: 1,
  },
  buttonContainer: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    margin: MARGIN / 2,
  },
  shadowBox: {
    position: 'absolute',
    width: BOX_SIZE - 10,
    height: BOX_SIZE - 10,
    backgroundColor: colors.black,
    top: 10,
    left: 10,
    zIndex: 0,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 8,
  },
  categoryBox: {
    width: BOX_SIZE - 10,
    height: BOX_SIZE - 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.black,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 10,
  },
  categoryText: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  categoryFlashListContainer: {
    paddingHorizontal: MARGIN / 2,
  },
});

export default NewOrderScreen;
