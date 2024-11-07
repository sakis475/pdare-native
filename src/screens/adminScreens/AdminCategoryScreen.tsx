import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  ScrollView,
  StyleProp,
  Modal,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { AlertWithOptions, getTextColorBasedOnLuminance, toast } from '../../core/utils';
import { colors } from '../../core/theme';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { getStorage, setStorage } from '../../storage/store';
import { navigate, ScreenNames } from '../../navigation/AppNavigator';
import { TextInput, Button } from 'react-native-paper';
import ColorPicker from 'react-native-wheel-color-picker';
import { getItemsOfCategory } from '../../helpers/storage/orderStorage';
import { ActivityIndicator, FAB } from 'react-native-paper';
import { patchRequest } from '../../helpers/requests';
import { LoadingOverlay } from '../../components/basic/SavingOverlay';

const GRID_SIZE = 4;
const MARGIN = 4;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_MARGIN = MARGIN * (GRID_SIZE + 1);
const BOX_SIZE = (SCREEN_WIDTH - TOTAL_MARGIN) / GRID_SIZE;
const GRID_WIDTH = BOX_SIZE * GRID_SIZE + MARGIN * (GRID_SIZE - 1);
const DRAG_HANDLE_SIZE = 20;

interface BoxData extends Category {
  index: number;
  onEdit?: any;
}

interface EditModalProps {
  visible: boolean;
  category?: Category | null;
  onDismiss: () => void;
  onSave: (updatedCategory: Category) => void;
  onDelete?: (id: number) => void;
  mode: 'edit' | 'create';
}

type BoxProps = {
  item: BoxData;
  categoriesLength: number;
  onDragEnd: (fromIndex: number, toIndex: number | null) => void;
};

const handleCategoryPress = (screenName: ScreenNames, props: any = null) => {
  navigate(screenName, props);
};

const isCategoryEmpty = async (category: Category) => {
  const itemsOfCategory = await getItemsOfCategory(category);

  return itemsOfCategory.length === 0;
};

const EditModal: React.FC<EditModalProps> = ({
  visible,
  category,
  onDismiss,
  onSave,
  onDelete,
  mode,
}) => {
  const [title, setTitle] = useState(category?.title || '');
  const [color, setColor] = useState(category?.color || colors.darkGrey);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    setTitle(category?.title || '');
    setColor(category?.color || colors.darkGrey);
  }, [category]);

  const handleSave = () => {
    if (!title.trim()) {
      AlertWithOptions(
        '',
        `Ο τίτλος της κατηγορίας είναι κενός`,
        undefined,
        undefined,
        undefined,
        ''
      );
      return;
    }

    if (mode === 'create') {
      const newCategory: Category = {
        title: title.trim(),
        color,
        isEnabled: true,
        orderCategory: 1,
      };
      onSave(newCategory);
    } else {
      onSave({
        ...category,
        title: title.trim(),
        color,
      });
    }
    onDismiss();
  };

  const handleDelete = async () => {
    if (!category || !onDelete) return;

    if (await isCategoryEmpty(category)) {
      AlertWithOptions(
        'Επιβεβαίωση Διαγραφής',
        `Είστε σίγουροι ότι θέλετε να διαγράψετε την κατηγορία "${category.title}";`,
        () => {
          onDelete(category.id);
          onDismiss();
        },
        undefined,
        'Διαγραφή'
      );
    } else {
      AlertWithOptions(
        'Η διαγραφή δεν επιτρέπεται',
        `Πρέπει πρώτα να διαγράψετε όλα τα προιόντα της κατηγορίας`,
        undefined,
        undefined,
        undefined,
        ''
      );
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {mode === 'create' ? 'Δημιουργία Κατηγορίας' : 'Ενημέρωση Κατηγορίας'}
          </Text>

          <TextInput
            label="Τίτλος Κατηγορίας"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            mode="outlined"
          />

          <TouchableOpacity
            style={[styles.colorPreview, { backgroundColor: color }]}
            onPress={() => setShowColorPicker(!showColorPicker)}
          >
            <Text style={{ color: getTextColorBasedOnLuminance(color) }}>
              Επιλογή Χρώματος Κατηγορίας
            </Text>
          </TouchableOpacity>

          {showColorPicker && (
            <View style={styles.colorPickerContainer}>
              <ColorPicker
                color={color}
                onColorChange={setColor}
                thumbSize={30}
                sliderSize={40}
                noSnap={true}
                row={true}
              />
            </View>
          )}
          <View style={styles.buttonUpdateContainer}>
            {mode === 'edit' && onDelete && (
              <Button
                mode="outlined"
                onPress={handleDelete}
                style={[styles.deleteButton]}
                textColor={colors.lightRed}
              >
                <FontAwesome6 name="trash" size={15} color={colors.lightRed} />
              </Button>
            )}

            <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
              {mode === 'create' ? 'Δημιουργία' : 'Αποθήκευση'}
            </Button>
          </View>
          <View style={styles.buttonUpdateContainer}>
            <Button mode="outlined" onPress={onDismiss} style={styles.cancelButton}>
              Ακύρωση
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const CategoryBox: React.FC<Category & { onEdit?: () => void }> = (category) => {
  const textColor = getTextColorBasedOnLuminance(category.color ?? colors.darkGrey);
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[styles.categoryBox, { backgroundColor: category.color ?? colors.darkGrey }]}
        onPress={() => {
          handleCategoryPress(ScreenNames.ManageItemsScreen, {
            categoryTitle: category.title,
          });
        }}
        activeOpacity={0.7}
      >
        <TouchableOpacity style={styles.editButton} onPress={category.onEdit}>
          <FontAwesome6 name="pencil" size={16} color={textColor} />
        </TouchableOpacity>
        <Text style={{ color: textColor, fontWeight: 'bold' }}>{category.title}</Text>
      </TouchableOpacity>
    </View>
  );
};

const Box: React.FC<BoxProps> = ({ item, onDragEnd, categoriesLength }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
  }, [categoriesLength]);

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { startX: number; startY: number }
  >({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
      isDragging.value = true;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: () => {
      const totalItems = categoriesLength;
      const itemRow = Math.floor(item.index / GRID_SIZE);
      const itemCol = item.index % GRID_SIZE;

      const currentCenterX = itemCol * (BOX_SIZE + MARGIN) + translateX.value + BOX_SIZE / 2;
      const currentCenterY = itemRow * (BOX_SIZE + MARGIN) + translateY.value + BOX_SIZE / 2;

      let closestIndex = item.index;
      let minDistance = Number.MAX_VALUE;

      // Only consider valid indices based on current total items
      for (let i = 0; i < totalItems; i++) {
        const targetRow = Math.floor(i / GRID_SIZE);
        const targetCol = i % GRID_SIZE;
        const targetCenterX = targetCol * (BOX_SIZE + MARGIN) + BOX_SIZE / 2;
        const targetCenterY = targetRow * (BOX_SIZE + MARGIN) + BOX_SIZE / 2;

        const distance = Math.sqrt(
          Math.pow(currentCenterX - targetCenterX, 2) + Math.pow(currentCenterY - targetCenterY, 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }

      if (closestIndex !== item.index) {
        runOnJS(onDragEnd)(item.index, closestIndex);
      } else {
        runOnJS(onDragEnd)(item.index, null);
      }

      translateX.value = 0;
      translateY.value = 0;
      isDragging.value = false;
    },
  });

  const animatedStyle = useAnimatedStyle<StyleProp<any>>(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    zIndex: isDragging.value ? 1 : 0,
  }));

  return (
    <Animated.View style={[styles.boxWrapper, animatedStyle]}>
      <CategoryBox {...item} />
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.dragHandle]}>
          <FontAwesome6
            name="bars"
            size={DRAG_HANDLE_SIZE}
            color={getTextColorBasedOnLuminance(item.color ?? colors.darkGrey)}
          />
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
};

const AdminCategoryScreen = () => {
  const [categories, setCategories] = useState<BoxData[]>();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [modalMode, setModalMode] = useState<'edit' | 'create'>('edit');
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = async () => {
    const allCategories = await getStorage('categories');
    if (!allCategories) {
      return;
    }

    let index = 0;
    const categoriesf = allCategories.map((e) => Object.assign(e, { index: index++ }));
    setCategories(categoriesf);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryUpdate = async (boxData: BoxData[]) => {
    setIsLoading(true);
    try {
      for (const [index, category] of boxData.entries()) {
        category.orderCategory = index;
      }
      const allCategoriesResult: BoxData[] = await patchRequest('/categories/updateMany', boxData);
      for (const category of allCategoriesResult) {
        category.index = category.orderCategory;
      }
      await setStorage('categories', allCategoriesResult);
      setCategories(allCategoriesResult);

      toast('success', 'Επιτυχία', 'Οι αλλαγές αποθηκεύτηκαν επιτυχώς', 1100);
    } catch (error) {
      toast('error', 'Σφάλμα', 'Παρουσιάστηκε σφάλμα κατά την αποθήκευση');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = async (updatedCategory: Category) => {
    const newCategories = categories.map((cat) =>
      cat.id === updatedCategory.id ? { ...updatedCategory, index: cat.index } : cat
    );
    await handleCategoryUpdate(newCategories);
  };

  const handleCreateCategory = async (newCategory: Category) => {
    const newCategories = [
      ...(categories || []),
      { ...newCategory, index: categories?.length || 0 },
    ];
    await handleCategoryUpdate(newCategories);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    const newCategories = categories.map((cat) =>
      cat.id === categoryId ? { ...cat, isEnabled: false } : cat
    );
    await handleCategoryUpdate(newCategories);
  };

  const handleEditPress = (category: Category) => {
    setSelectedCategory(category);
    setModalMode('edit');
    setModalVisible(true);
  };

  const handleCreatePress = () => {
    setSelectedCategory(null);
    setModalMode('create');
    setModalVisible(true);
  };

  const onDragEnd = useCallback(
    (fromIndex: number, toIndex: number | null) => {
      if (toIndex === null || toIndex === fromIndex) {
        return;
      }

      const copyCategories = [...categories];
      copyCategories[fromIndex] = categories[toIndex];
      copyCategories[toIndex] = categories[fromIndex];

      handleCategoryUpdate(copyCategories);
    },
    [categories, handleCategoryUpdate]
  );

  return (
    <>
      {categories?.length ? (
        <View style={styles.mainContainer}>
          <ScrollView
            style={styles.scrollViewContainer}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              <View style={styles.grid}>
                {categories
                  .filter((category) => category.isEnabled !== false)
                  .map((category) => (
                    <Box
                      key={`category-${category.id}`}
                      item={{
                        ...category,
                        onEdit: () => handleEditPress(category),
                      }}
                      onDragEnd={onDragEnd}
                      categoriesLength={categories.length}
                    />
                  ))}
              </View>
            </View>
          </ScrollView>

          <FAB icon="plus" style={styles.fab} onPress={handleCreatePress} />
        </View>
      ) : (
        <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
      )}

      <EditModal
        visible={modalVisible}
        category={selectedCategory}
        onDismiss={() => {
          setModalVisible(false);
          setSelectedCategory(null);
        }}
        onSave={modalMode === 'create' ? handleCreateCategory : handleEditCategory}
        onDelete={modalMode === 'edit' ? handleDeleteCategory : undefined}
        mode={modalMode}
      />

      {isLoading && <LoadingOverlay />}
    </>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#2F2F2F',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: MARGIN,
    paddingTop: MARGIN,
  },
  grid: {
    width: GRID_WIDTH,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  boxWrapper: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    marginBottom: MARGIN,
  },
  buttonContainer: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  categoryBox: {
    width: BOX_SIZE - 10,
    height: BOX_SIZE - 10,
    padding: 5,
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
  dragHandle: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: DRAG_HANDLE_SIZE,
    height: DRAG_HANDLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  editButton: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: DRAG_HANDLE_SIZE,
    height: DRAG_HANDLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
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
  colorPreview: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 20,
  },
  colorPickerContainer: {
    height: 300,
    marginBottom: 20,
  },
  colorPickerButton: {
    marginTop: 10,
  },
  buttonUpdateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  deleteButton: {
    borderColor: 'red',
    minWidth: 48,
    padding: 0,
  },
  cancelButton: {
    flex: 1,
    fontSize: 20,
  },
  saveButton: {
    flex: 3,
  },
  mainContainer: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});

export default AdminCategoryScreen;
