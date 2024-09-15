import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { colors } from '../../core/theme';
import { reqFetchItems } from '../../helpers/storage/orderStorage';
import { CategoryEditable } from '../../components/itemComponents/CategoryEditable';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
const ManageProductsScreen = ({ route }: any) => {
  const [items, setItems] = useState<catGroupedItems>();
  const [categories, setCategories] = useState<Category[]>();

  const fetchItems = async () => {
    const items = await reqFetchItems();

    if (!items) {
      return Promise<null>;
    }

    const categories: Category[] = [];
    for (const categoryName of Object.keys(items)) {
      const category = items[categoryName].length > 0 ? items[categoryName][0].category : null;
      if (category) {
        categories.push(category);
      }
    }

    categories.sort((a, b) => a.orderCategory - b.orderCategory);

    const fakeCategories: Category[] = [
      { id: 0, title: 'Beverage0', orderCategory: 0, isEnabled: true },
      { id: 1, title: 'Beverage1', orderCategory: 0, isEnabled: true },
      { id: 2, title: 'Beverage2', orderCategory: 0, isEnabled: true },
      { id: 3, title: 'Beverage3', orderCategory: 0, isEnabled: true },
      { id: 4, title: 'Beverage4', orderCategory: 0, isEnabled: true },
      { id: 5, title: 'Beverage5', orderCategory: 0, isEnabled: true },
      { id: 6, title: 'Beverage6', orderCategory: 0, isEnabled: true },
    ];
    setCategories(fakeCategories);
    setItems(items);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const CategoryItemDraggable = ({ item, drag, isActive }: RenderItemParams<Category>) => {
    return (
      <View style={[styles.item, { backgroundColor: isActive ? colors.darkGrey : colors.grey }]}>
        <Pressable
          onPressIn={drag} // Activates drag as soon as the touch starts
          disabled={isActive}
          style={styles.dragHandle}
        >
          <FontAwesome6 name="bars" size={20} color="#fff"></FontAwesome6>
        </Pressable>
        <CategoryEditable category={item} />
      </View>
    );
  };

  const renderItem = (params: RenderItemParams<Category>) => {
    return <CategoryItemDraggable {...params} />;
  };

  return (
    <View style={styles.container}>
      {categories && categories.length > 0 && (
        <DraggableFlatList
          data={categories}
          onDragEnd={({ data }) => setCategories(data)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2F2F2F',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 4,
    marginVertical: 6,
    backgroundColor: colors.grey,
    borderRadius: 8,
  },
  dragHandle: {
    padding: 4,
    backgroundColor: colors.darkGrey,
    borderRadius: 4,
  },
  dragHandleText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ManageProductsScreen;
