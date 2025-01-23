import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Pressable,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Button, Divider, FAB, Text, TextInput } from 'react-native-paper';
import { getStorage, setStorage } from '../../storage/store';
import { colors } from '../../core/theme';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { CategoryHeader } from '../../components/helpers/CategoryHeader';
import { CatalogItemEditable } from '../../components/itemComponents/CatalogItemEditable';
import { AlertWithOptions, toast } from '../../core/utils';
import { patchRequest } from '../../helpers/requests';
import { LoadingOverlay } from '../../components/basic/SavingOverlay';
import { findCategoryByTitle } from '../../helpers/storage/orderStorage';
import { useStrings } from '../../core/localization/languageContext';
import { BarsIcon, EditIcon, TrashIcon } from '../../components/basic/Icons';

interface EditItemModalProps {
  visible: boolean;
  item?: ItemReq | null;
  onDismiss: () => void;
  onSave: (updatedItem: ItemReq) => void;
  onDelete?: (id: number) => void;
  mode: 'edit' | 'create';
}

const EditItemModal: React.FC<EditItemModalProps> = ({
  visible,
  item,
  onDismiss,
  onSave,
  onDelete,
  mode,
}) => {
  const [title, setTitle] = useState(item?.title || '');
  const [description, setDescription] = useState(item?.description || '');
  const [cost, setCost] = useState(item?.cost?.toString() || '');

  const strings = useStrings();

  useEffect(() => {
    setTitle(item?.title || '');
    setDescription(item?.description || '');
    setCost(item?.cost?.toString() || '');
  }, [item]);

  const handleSave = () => {
    if (!title.trim()) {
      AlertWithOptions('', strings.EMPTY_PRODUCT_TITLE_ERROR, undefined, undefined, undefined, '');
      return;
    }

    if (!cost || isNaN(Number(cost))) {
      AlertWithOptions('', strings.PRICE_NUMBER_ERROR, undefined, undefined, undefined, '');
      return;
    }

    if (mode === 'create') {
      const newItem: ItemReq = {
        title: title.trim(),
        description: description.trim(),
        cost: Number(cost),
        isEnabled: true,
        category: item?.category,
        itemPropertiesGrouped: [],
        orderItem: 0,
        quantity: 0,
      };
      onSave(newItem);
    } else if (item) {
      onSave({
        ...item,
        title: title.trim(),
        description: description.trim(),
        cost: Number(cost),
      });
    }
    onDismiss();
  };

  const handleDelete = () => {
    if (!item || !onDelete) return;

    AlertWithOptions(
      strings.DELETE_CONFIRMATION,
      `${strings.DELETE_PATTERN_CONFIRM} "${item.title}"${strings.QUESTION_MARK}`,
      () => {
        onDelete(item.id);
        onDismiss();
      },
      undefined,
      'Διαγραφή'
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {mode === 'create' ? `${strings.CREATE_PRODUCT}` : `${strings.UPDATE_PRODUCT}`}
          </Text>

          <TextInput
            label={strings.PRODUCT_TITLE}
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label={strings.DESCRIPTION}
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
          />

          <TextInput
            label={strings.PRICE}
            value={cost}
            onChangeText={setCost}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
          />

          <View style={styles.buttonContainer}>
            {mode === 'edit' && onDelete && (
              <Button
                mode="outlined"
                onPress={handleDelete}
                style={[styles.deleteButton]}
                textColor={colors.lightRed}
              >
                <TrashIcon size={15} color={colors.lightRed} />
              </Button>
            )}

            <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
              {mode === 'create' ? strings.CREATE : strings.SAVE}
            </Button>
          </View>
          <View style={styles.buttonContainer}>
            <Button mode="outlined" onPress={onDismiss} style={styles.cancelButton}>
              {strings.CANCEL}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AdminItemListScreen = ({ route }: any) => {
  const [categoryTitle, setCategoryTitle] = useState(route.params?.categoryTitle);
  const [items, setItems] = useState<ItemReq[]>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemReq | null>(null);
  const [modalMode, setModalMode] = useState<'edit' | 'create'>('edit');
  const [isLoading, setIsLoading] = useState(false);

  const strings = useStrings();

  const fetchItems = async () => {
    const fetchedItems: catGroupedItems = (await getStorage('groupedItems')) || {};
    const categoryItems = fetchedItems[categoryTitle] ?? [];
    setItems(categoryItems);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleItemUpdate = async (updatedItems: ItemReq[]) => {
    setIsLoading(true);
    try {
      for (const [index, updatedItem] of updatedItems.entries()) {
        updatedItem.orderItem = index;
      }
      // Send to server
      const response = await patchRequest('/items/save', updatedItems);
      if (!Array.isArray(response)) {
        return;
      }
      // Update local storage
      const allItems: catGroupedItems = (await getStorage('groupedItems')) || {};
      allItems[categoryTitle] = response;
      await setStorage('groupedItems', allItems);

      // Update state
      setItems(response);

      toast('success', strings.SUCCESS, strings.CHANGES_SAVED);
    } catch (error) {
      console.error('Error updating items:', error);
      toast('error', strings.ERROR, strings.SAVE_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditItem = async (updatedItem: ItemReq) => {
    const newItems = items.map((item) => (item.id === updatedItem.id ? updatedItem : item));
    await handleItemUpdate(newItems);
  };

  const handleCreateItem = async (newItem: ItemReq) => {
    let category: Category = items?.[0]?.category;
    if (!category) {
      category = await findCategoryByTitle(route.params?.categoryTitle);
    }

    const itemWithCategory = {
      ...newItem,
      category,
    };
    const otherItems = Array.isArray(items) ? [...items] : [];
    const newItems = [...otherItems, itemWithCategory];
    await handleItemUpdate(newItems);
  };

  const handleDelete = async (id: number) => {
    const newItems = items.map((item) => (item.id === id ? { ...item, isEnabled: false } : item));
    await handleItemUpdate(newItems);
  };

  const handleEditPress = (item: ItemReq) => {
    setSelectedItem(item);
    setModalMode('edit');
    setModalVisible(true);
  };

  const handleCreatePress = () => {
    setSelectedItem(null);
    setModalMode('create');
    setModalVisible(true);
  };

  const handleDragEnd = useCallback(
    async ({ data, from, to }: { data: ItemReq[]; from: number; to: number }) => {
      // Only update if position actually changed
      if (from !== to) {
        setIsLoading(true);

        // Create a deep copy of the data with new order indices
        const updatedItems = data.map((item, index) => ({
          ...item,
          orderItem: index,
        }));

        // Update the UI immediately with the new order
        setItems(updatedItems);

        try {
          // Send the update to the server
          await handleItemUpdate(updatedItems);
        } catch (error) {
          // If server update fails, revert to original order
          console.error('Failed to update item order:', error);
          const originalItems = [...items].map((item, index) => ({
            ...item,
            orderItem: index,
          }));
          setItems(originalItems);
        }
      } else {
        console.log('No order change detected, skipping update');
      }
    },
    [items, handleItemUpdate]
  );

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<ItemReq>) => {
      // Create a new object without orderItem for the draggable component
      const itemForRender = { ...item };
      delete itemForRender.orderItem; // Remove orderItem to prevent Reanimated warning

      return (
        <View style={[styles.item, { backgroundColor: isActive ? colors.darkGrey : colors.grey }]}>
          <Pressable onPressIn={drag} disabled={isActive} style={styles.dragHandle}>
            <BarsIcon size={20} color="#fff" />
          </Pressable>
          <TouchableOpacity style={styles.editButton} onPress={() => handleEditPress(item)}>
            <EditIcon size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.itemContent}>
            <CatalogItemEditable item={itemForRender} />
          </View>
        </View>
      );
    },
    [handleEditPress]
  );

  return (
    <View style={styles.container}>
      {items?.length > 0 ? (
        <>
          <CategoryHeader title={items[0].category?.title} />
          <View style={styles.categoriesContainer}>
            <DraggableFlatList
              data={items.filter((item) => item.isEnabled !== false)}
              renderItem={renderItem}
              keyExtractor={(item) =>
                `draggableItem-${item?.id}-${item?.title}-${item?.category?.title}`
              }
              onDragEnd={handleDragEnd}
              contentContainerStyle={styles.categoryFlashListContainer}
              ItemSeparatorComponent={Divider}
            />
          </View>

          <FAB
            icon="plus"
            style={styles.fab}
            onPress={handleCreatePress}
            color={colors.white}
            animated={false}
          />
        </>
      ) : items?.length === 0 ? (
        <>
          {categoryTitle ? <CategoryHeader title={categoryTitle} /> : null}
          <View
            style={{
              justifyContent: 'center',
              alignContent: 'center',
              flex: 1,
              paddingHorizontal: 20,
            }}
          >
            <Text style={{ textAlign: 'center', color: colors.white }}>
              {strings.PRODUCTS_WILL_APPEAR}
            </Text>
            <FAB
              icon="plus"
              style={styles.fab}
              onPress={handleCreatePress}
              color={colors.white}
              animated={false}
            />
          </View>
        </>
      ) : (
        <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
      )}

      <EditItemModal
        visible={modalVisible}
        item={selectedItem}
        onDismiss={() => {
          setModalVisible(false);
          setSelectedItem(null);
        }}
        onSave={modalMode === 'create' ? handleCreateItem : handleEditItem}
        onDelete={modalMode === 'edit' ? handleDelete : undefined}
        mode={modalMode}
      />

      {isLoading && <LoadingOverlay />}
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
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: colors.grey,
  },
  input: {
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  deleteButton: {
    borderColor: colors.lightRed,
    minWidth: 48,
    padding: 0,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 3,
  },
  editButton: {
    padding: 8,
    marginRight: 4,
    backgroundColor: colors.darkGrey,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AdminItemListScreen;
