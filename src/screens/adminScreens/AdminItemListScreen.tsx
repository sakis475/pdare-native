import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Keyboard, Pressable } from 'react-native';
import { Divider } from 'react-native-paper';
import { getStorage, setStorage } from '../../storage/store';
import { colors } from '../../core/theme';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { CategoryHeader } from '../../components/helpers/CategoryHeader';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { CatalogItemEditable } from '../../components/itemComponents/CatalogItemEditable';

const AdminItemListScreen = ({ route }: any) => {
  const [categoryTitle, setCategoryTitle] = useState(route.params?.categoryTitle || 'Καφές');
  const [items, setItems] = useState<ItemReq[]>([]);

  const fetchItems = async () => {
    const fetchedItems: catGroupedItems = (await getStorage('groupedItems')) || {};
    const categoryItems = fetchedItems[categoryTitle];
    setItems(categoryItems);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const bottomSheetRef = useRef<{ openModal: () => void; closeModal: () => void }>(null);

  const handleOpenModal = () => {
    bottomSheetRef.current?.openModal();
  };

  const handleCloseModal = () => {
    bottomSheetRef.current?.closeModal();
    Keyboard.dismiss();
  };

  const handleDragEnd = useCallback(
    async ({ data }: { data: ItemReq[] }) => {
      setItems(data);
      // Update the order in storage
      const allItems: catGroupedItems = (await getStorage('groupedItems')) || {};
      allItems[categoryTitle] = data;
      await setStorage('groupedItems', allItems);
    },
    [categoryTitle]
  );

  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<ItemReq>) => {
    return (
      <View style={[styles.item, { backgroundColor: isActive ? colors.darkGrey : colors.grey }]}>
        <Pressable onPressIn={drag} disabled={isActive} style={styles.dragHandle}>
          <FontAwesome6 name="bars" size={20} color="#fff" />
        </Pressable>
        <View style={styles.itemContent}>
          <CatalogItemEditable item={item} />
        </View>
      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      {items?.length > 0 ? (
        <>
          <CategoryHeader title={items[0].category?.title} />
          <View style={styles.categoriesContainer}>
            <DraggableFlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              onDragEnd={handleDragEnd}
              contentContainerStyle={styles.categoryFlashListContainer}
              ItemSeparatorComponent={Divider}
            />
          </View>
          {/* <OrderBottomOptions
            tableName={tableName}
            handleOpenModal={handleOpenModal}
            handleTempOrderPress={handleTempOrderPress}
          /> */}
          {/* <TableSelectBottomSheet ref={bottomSheetRef} handleSelectTable={handleSelectTable} /> */}
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
  },
  categoriesContainer: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginVertical: 4,
    backgroundColor: colors.grey,
    borderRadius: 8,
  },
  dragHandle: {
    padding: 8,
    marginRight: 10,
    backgroundColor: colors.darkGrey,
    borderRadius: 4,
  },
  itemContent: {
    flex: 1,
  },
  categoryFlashListContainer: {
    paddingHorizontal: 20,
  },
});

export default AdminItemListScreen;
