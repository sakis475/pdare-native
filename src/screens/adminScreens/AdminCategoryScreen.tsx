import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  ScrollView,
  StyleProp,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { AlertWithOptions, getTextColorBasedOnLuminance, toast } from '../../core/utils';
import { colors, getRandomColor } from '../../core/theme';
import { getStorage, setStorage } from '../../storage/store';
import { getItemsOfCategory } from '../../helpers/storage/orderStorage';
import { ActivityIndicator, FAB } from 'react-native-paper';
import { patchRequest } from '../../helpers/requests';
import { LoadingOverlay } from '../../components/basic/SavingOverlay';
import { navigate, ScreenNames } from '../../navigation/navigationUtils';
import { useStrings } from '../../core/localization/languageContext';
import { BarsIcon, EditIcon } from '../../components/basic/Icons';
import CustomTextInput from '../../components/basic/CustomTextInput';
import BaseModal from '../../components/basic/BaseModal';
import CustomButton from '../../components/basic/CustomButton';
import CustomSegmentedButtons from '../../components/basic/CustomSegmentedButtons';
import { Category } from '../../types/basic.types';
import { FlashList } from '@shopify/flash-list';

const GRID_SIZE = 4;
const MARGIN = 4;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOX_SIZE = Math.floor((SCREEN_WIDTH - MARGIN * 2) / GRID_SIZE) - MARGIN;
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

enum PrintLocation {
  KITCHEN = 'kitchen',
  BAR = 'bar',
  ALL = 'all',
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
  const [printLocation, setPrintLocation] = useState<PrintLocation>(
    category?.printLocation || PrintLocation.ALL
  );
  const [showColorPicker, setShowColorPicker] = useState(false);

  const strings = useStrings();

  const handlePrintLocationChange = (value: string) => {
    setPrintLocation(value as PrintLocation);
  };

  useEffect(() => {
    if (visible) {
      setTitle(category?.title || '');
      setColor(category?.color || getRandomColor());
      setPrintLocation(category?.printLocation || PrintLocation.ALL);
    } else {
      setTitle('');
      setColor(colors.darkGrey);
      setPrintLocation(PrintLocation.ALL);
      setShowColorPicker(false);
    }
  }, [visible, category]);

  const handleSave = () => {
    if (!title.trim()) {
      AlertWithOptions('', strings.EMPTY_TITLE_ERROR, undefined, undefined, undefined, '');
      return;
    }

    if (mode === 'create') {
      const newCategory: Category = {
        title: title.trim(),
        color,
        printLocation,
        isEnabled: true,
        orderCategory: 1,
      };
      onSave(newCategory);
    } else {
      onSave({
        ...category,
        title: title.trim(),
        color,
        printLocation,
      });
    }
    onDismiss();
  };

  const handleDelete = async () => {
    if (!category || !onDelete) return;

    if (await isCategoryEmpty(category)) {
      AlertWithOptions(
        strings.DELETE_CONFIRMATION,
        `${strings.DELETE_CATEGORY_CONFIRM} "${category.title}"${strings.QUESTION_MARK}`,
        () => {
          onDelete(category.id);
          onDismiss();
        },
        undefined,
        strings.DELETE
      );
    } else {
      AlertWithOptions(
        strings.DELETE_NOT_ALLOWED,
        strings.DELETE_PRODUCTS_FIRST,
        undefined,
        undefined,
        undefined,
        ''
      );
    }
  };

  const printLocationOptions = [
    { value: PrintLocation.ALL, label: strings.ALL },
    { value: PrintLocation.BAR, label: strings.BAR },
    { value: PrintLocation.KITCHEN, label: strings.KITCHEN },
  ];

  const predefinedColors = [
    '#FF5733',
    '#33FF57',
    '#3357FF',
    '#FF33A1',
    '#33FFF5',
    '#F5FF33',
    '#A133FF',
    '#FF3333',
    '#33FFA1',
    '#5733FF',
    '#33FF33',
    '#FFC300',
    '#C70039',
    '#900C3F',
    '#581845',
    '#1A5276',
    '#2E86C1',
    '#AED6F1',
    '#F7DC6F',
    '#D35400',
  ];

  return (
    <BaseModal
      title={mode === 'create' ? strings.CREATE_CATEGORY : strings.UPDATE_CATEGORY}
      visible={visible}
      onClose={onDismiss}
      onConfirm={handleSave}
      testID="category-edit-modal"
    >
      <CustomTextInput
        label={strings.CATEGORY_TITLE}
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        mode="outlined"
        theme="light"
      />

      <TouchableOpacity
        style={[styles.colorPreview, { backgroundColor: color }]}
        onPress={() => setShowColorPicker(!showColorPicker)}
      >
        <Text style={{ color: getTextColorBasedOnLuminance(color) }}>
          {strings.SELECT_CATEGORY_COLOR}
        </Text>
      </TouchableOpacity>

      {showColorPicker && (
        <View style={styles.colorGrid}>
          <FlashList
            data={predefinedColors}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.colorButton, { backgroundColor: item }]}
                onPress={() => setColor(item)}
              />
            )}
            keyExtractor={(item) => `colorbox-${item}`}
            estimatedItemSize={20}
            numColumns={5} // Fixed 5 columns
          />
        </View>
      )}

      <Text style={styles.sectionLabel}>{strings.PRINT_LOCATION}</Text>
      <CustomSegmentedButtons
        value={printLocation}
        onValueChange={handlePrintLocationChange}
        buttons={printLocationOptions.map((option) => ({
          value: option.value,
          label: option.label,
          style: styles.segmentButton,
        }))}
        style={styles.segmentedButtons}
      />

      {mode === 'edit' && onDelete && (
        <View style={{ marginBottom: 5 }}>
          <CustomButton onPress={handleDelete} variant={'delete'}>
            <Text style={{ color: colors.white }}>{strings.DELETE}</Text>
          </CustomButton>
        </View>
      )}
    </BaseModal>
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
          <EditIcon size={20} color={textColor}></EditIcon>
        </TouchableOpacity>
        <Text style={{ color: textColor, fontWeight: 'bold', padding: 3 }}>{category.title}</Text>
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
          <BarsIcon
            size={DRAG_HANDLE_SIZE}
            color={getTextColorBasedOnLuminance(item.color ?? colors.darkGrey)}
          ></BarsIcon>
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

      toast('success', strings.SUCCESS, strings.CHANGES_SAVED, 1100);
    } catch (error) {
      toast('error', strings.ERROR, strings.SAVE_ERROR);
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
  const strings = useStrings();
  return (
    <>
      <View style={styles.mainContainer}>
        {categories?.length ? (
          <>
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

            <FAB
              icon="plus"
              style={styles.fab}
              onPress={handleCreatePress}
              color={colors.white}
              animated={false}
            />
          </>
        ) : categories?.length === 0 ? (
          <>
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{strings.CATEGORIES_WILL_APPEAR}</Text>
              <Text style={styles.emptyText}>{strings.CATEGORIES_WILL_APPEAR_HERE}</Text>
            </View>
            <FAB
              icon="plus"
              style={styles.fab}
              onPress={handleCreatePress}
              color={colors.white}
              animated={false}
            />
          </>
        ) : (
          <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
        )}
      </View>

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
    paddingBottom: 100,
    backgroundColor: '#2F2F2F',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: MARGIN,
    paddingBottom: 80,
    backgroundColor: '#2F2F2F',
  },
  grid: {
    width: GRID_WIDTH,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: MARGIN, // This ensures even spacing between items
  },
  boxWrapper: {
    width: BOX_SIZE,
    height: BOX_SIZE,
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
    flex: 1,
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
    height: 230,
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F2F2F',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: colors.white,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 16,
    color: colors.grey,
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 20,
  },
  segmentButton: {
    flex: 1,
  },
  colorGrid: {
    flex: 1, // Ensure the grid takes up available space
    width: '100%', // Ensure the grid spans the full width
    marginBottom: 20, // Add some spacing below the grid
  },
  colorButton: {
    flex: 1, // Ensure buttons take up equal space
    aspectRatio: 1, // Ensure buttons are square
    margin: 4, // Add spacing between buttons
    borderRadius: 10, // Rounded corners
    borderWidth: 2, // Add a border
    borderColor: '#000', // Border color
  },
});

export default AdminCategoryScreen;
