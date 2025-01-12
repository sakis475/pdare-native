import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
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
import CustomNavigationScreenHeaderTitle from '../../components/basic/CustomNavigationScreenHeaderTitle';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_COUNT = 4;
const MARGIN = 1;
const BOX_SIZE = (SCREEN_WIDTH - MARGIN * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

// Memoized category item component
const CategoryItem = memo(
  ({
    category,
    tableName,
    onPress,
  }: {
    category: Category;
    tableName: string;
    onPress: (screenName: ScreenNames, props: any) => void;
  }) => {
    const textColor = getTextColorBasedOnLuminance(category.color ?? colors.darkGrey);

    const handlePress = useCallback(() => {
      onPress(ScreenNames.ItemListScreen, {
        tableName,
        categoryTitle: category.title,
      });
    }, [category.title, tableName, onPress]);

    return (
      <View style={styles.buttonContainer}>
        <View style={styles.shadowBox} />
        <TouchableOpacity
          style={[styles.categoryBox, { backgroundColor: category.color ?? colors.darkGrey }]}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <Text style={[styles.categoryText, { color: textColor }]}>{category.title}</Text>
        </TouchableOpacity>
      </View>
    );
  }
);

const NewOrderScreen = ({ route, navigation }: any) => {
  const [tableName, setTableName] = useState(route.params?.table?.tableName);
  const [categories, setCategories] = useState<Category[]>([]);
  const [headerTitle, setHeaderTitle] = useState('');
  const strings = useStrings();

  // Memoized callbacks
  const handleSelectTable = useCallback((table: Table) => {
    setTableName(table.tableName);
    setTableTempOrder(table);
  }, []);

  const handleCategoryPress = useCallback((screenName: ScreenNames, props: any = null) => {
    navigate(screenName, props);
  }, []);

  const handleTempOrderPress = useCallback(() => {
    navigateToDraft();
  }, []);

  const fetchItems = useCallback(async () => {
    let newOrder = await getStorage('groupedItems');
    if (!newOrder) {
      await storageInitData();
      newOrder = await getStorage('groupedItems');
    }

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

    const newTitle =
      !!tempOrder?.id || route.params?.table?.occupiedByOrder
        ? strings.UPDATE_ORDER
        : strings.NEW_ORDER;
    setHeaderTitle(newTitle);

    if (tempOrder?.table?.id !== route.params?.table?.id && route.params?.table?.occupiedByOrder) {
      await setTempOrder(route.params.table.occupiedByOrder);
    }
  }, [route.params?.table?.id, tableName, strings]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (navigation && headerTitle) {
      navigation.setOptions({
        headerTitle: () => (
          <CustomNavigationScreenHeaderTitle title={headerTitle} subtitle={tableName} bold={true} />
        ),
      });
    }
  }, [navigation, headerTitle, tableName]);

  const bottomSheetRef = useRef<{ openModal: () => void; closeModal: () => void }>(null);

  const handleOpenModal = useCallback(() => {
    bottomSheetRef.current?.openModal();
  }, []);

  const handleCloseModal = useCallback(() => {
    bottomSheetRef.current?.closeModal();
    Keyboard.dismiss();
  }, []);

  const renderCategories = useCallback(
    ({ item: category }: { item: Category }) => (
      <CategoryItem category={category} tableName={tableName} onPress={handleCategoryPress} />
    ),
    [tableName, handleCategoryPress]
  );

  const keyExtractor = useCallback((item: Category) => item.id.toString(), []);

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
              keyExtractor={keyExtractor}
              removeClippedSubviews={true}
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
        <ActivityIndicator size="large" animating={true} color={colors.primary} />
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
