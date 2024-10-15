import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { getTextColorBasedOnLuminance } from '../../core/utils';
import { colors } from '../../core/theme';

const GRID_SIZE = 3;
const MARGIN = 10;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOX_SIZE = (SCREEN_WIDTH - MARGIN * (GRID_SIZE + 1)) / GRID_SIZE;
const GRID_WIDTH = BOX_SIZE * GRID_SIZE + MARGIN * (GRID_SIZE - 1);
const SWAP_THRESHOLD = BOX_SIZE * 0.6; // Increased threshold for easier swapping

interface Category {
  id: number;
  title: string;
  color: string;
}

interface BoxData extends Category {
  index: number;
}

type BoxProps = {
  item: BoxData;
  onDragEnd: (fromIndex: number, toIndex: number | null) => void;
};

const CategoryBox: React.FC<Category> = (category) => {
  const textColor = getTextColorBasedOnLuminance(category.color ?? colors.darkGrey);
  return (
    <View style={styles.buttonContainer}>
      <View style={styles.shadowBox}></View>
      <TouchableOpacity
        style={[styles.categoryBox, { backgroundColor: category.color ?? colors.darkGrey }]}
        onPress={() => {
          console.log('pressed', category.title);
        }}
        activeOpacity={0.7}
      >
        <Text style={{ color: textColor, fontWeight: 'bold' }}>{category.title}</Text>
      </TouchableOpacity>
    </View>
  );
};

const Box: React.FC<BoxProps> = ({ item, onDragEnd }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { startX: number; startY: number }
  >({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: () => {
      const currentCenterX =
        (item.index % GRID_SIZE) * (BOX_SIZE + MARGIN) + translateX.value + BOX_SIZE / 2;
      const currentCenterY =
        Math.floor(item.index / GRID_SIZE) * (BOX_SIZE + MARGIN) + translateY.value + BOX_SIZE / 2;

      let closestIndex = null;
      let minDistance = Number.MAX_VALUE;

      for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const targetCenterX = (i % GRID_SIZE) * (BOX_SIZE + MARGIN) + BOX_SIZE / 2;
        const targetCenterY = Math.floor(i / GRID_SIZE) * (BOX_SIZE + MARGIN) + BOX_SIZE / 2;

        const distance = Math.sqrt(
          Math.pow(currentCenterX - targetCenterX, 2) + Math.pow(currentCenterY - targetCenterY, 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }

      // Swap if the closest box is within the threshold and it's not the original position
      if (closestIndex !== null && minDistance < SWAP_THRESHOLD && closestIndex !== item.index) {
        runOnJS(onDragEnd)(item.index, closestIndex);
      } else {
        runOnJS(onDragEnd)(item.index, null);
      }

      translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    //@ts-ignore
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    zIndex: translateX.value !== 0 || translateY.value !== 0 ? 1 : 0,
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.boxWrapper, animatedStyle]}>
        <CategoryBox {...item} />
      </Animated.View>
    </PanGestureHandler>
  );
};

const DraggableGridScreen: React.FC = () => {
  const [categories, setCategories] = useState<BoxData[]>([
    { id: 1, title: 'Category 1', color: '#FF5733', index: 0 },
    { id: 2, title: 'Category 2', color: '#33FF57', index: 1 },
    { id: 3, title: 'Category 3', color: '#3357FF', index: 2 },
    { id: 4, title: 'Category 4', color: '#FF33F1', index: 3 },
    { id: 5, title: 'Category 5', color: '#33FFF1', index: 4 },
    { id: 6, title: 'Category 6', color: '#F1FF33', index: 5 },
    { id: 7, title: 'Category 7', color: '#FF8C33', index: 6 },
    { id: 8, title: 'Category 8', color: '#8C33FF', index: 7 },
    { id: 9, title: 'Category 9', color: '#33FFCB', index: 8 },
  ]);

  const onDragEnd = useCallback((fromIndex: number, toIndex: number | null) => {
    if (toIndex === null || toIndex === fromIndex) {
      return; // No swap needed
    }

    setCategories((prevCategories) => {
      const newCategories = [...prevCategories];
      const [movedItem] = newCategories.splice(fromIndex, 1);
      newCategories.splice(toIndex, 0, movedItem);
      return newCategories.map((item, index) => ({ ...item, index }));
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {categories.map((category) => (
          <Box key={`category-${category.id}`} item={category} onDragEnd={onDragEnd} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: MARGIN,
  },
  grid: {
    width: GRID_WIDTH,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
  shadowBox: {
    position: 'absolute',
    width: BOX_SIZE,
    height: BOX_SIZE,
    backgroundColor: colors.black,
    top: 9,
    left: 5,
    zIndex: 0,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 8,
  },
  categoryBox: {
    width: BOX_SIZE,
    height: BOX_SIZE,
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
});

export default DraggableGridScreen;
