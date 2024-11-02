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
import { getTextColorBasedOnLuminance } from '../../core/utils';
import { colors } from '../../core/theme';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { getStorage } from '../../storage/store';
import { ActivityIndicator } from 'react-native-paper';
import { navigate, ScreenNames } from '../../navigation/AppNavigator';

const GRID_SIZE = 4;
const MARGIN = 4;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_MARGIN = MARGIN * (GRID_SIZE + 1);
const BOX_SIZE = (SCREEN_WIDTH - TOTAL_MARGIN) / GRID_SIZE;
const GRID_WIDTH = BOX_SIZE * GRID_SIZE + MARGIN * (GRID_SIZE - 1);
const DRAG_HANDLE_SIZE = 20;

interface BoxData extends Category {
  index: number;
}

type BoxProps = {
  item: BoxData;
  categoriesLength: number;
  onDragEnd: (fromIndex: number, toIndex: number | null) => void;
};

const handleCategoryPress = (screenName: ScreenNames, props: any = null) => {
  navigate(screenName, props);
};

const CategoryBox: React.FC<Category> = (category) => {
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
        <Text style={{ color: textColor, fontWeight: 'bold' }}>{category.title}</Text>
      </TouchableOpacity>
    </View>
  );
};

const Box: React.FC<BoxProps> = ({ item, onDragEnd, categoriesLength }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

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
      const actualRows = Math.ceil(totalItems / GRID_SIZE);
      const itemRow = Math.floor(item.index / GRID_SIZE);
      const itemCol = item.index % GRID_SIZE;

      const currentCenterX = itemCol * (BOX_SIZE + MARGIN) + translateX.value + BOX_SIZE / 2;
      const currentCenterY = itemRow * (BOX_SIZE + MARGIN) + translateY.value + BOX_SIZE / 2;

      let closestIndex = item.index;
      let minDistance = Number.MAX_VALUE;

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

      // Reset position immediately without animation
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
          ></FontAwesome6>
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
};

const AdminCategoryScreen = () => {
  const [categories, setCategories] = useState<BoxData[]>();

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

  const onDragEnd = useCallback((fromIndex: number, toIndex: number | null) => {
    if (toIndex === null || toIndex === fromIndex) {
      return;
    }

    setCategories((prevCategories) => {
      const newCategories = [...prevCategories];
      newCategories[fromIndex] = prevCategories[toIndex];
      newCategories[toIndex] = prevCategories[fromIndex];
      return newCategories.map((item, index) => ({ ...item, index }));
    });
  }, []);

  return (
    <>
      {categories?.length ? (
        <ScrollView
          style={styles.scrollViewContainer} // Apply the scrollViewContainer style here
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.grid}>
              {categories.map((category) => (
                <Box
                  key={`category-${category.id}`}
                  item={category}
                  onDragEnd={onDragEnd}
                  categoriesLength={categories.length}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
      )}
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
});

export default AdminCategoryScreen;
