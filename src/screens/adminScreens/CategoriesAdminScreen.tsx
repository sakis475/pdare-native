import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, StyleProp } from 'react-native';
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

const GRID_SIZE = 3;
const MARGIN = 10;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOX_SIZE = (SCREEN_WIDTH - MARGIN * (GRID_SIZE + 1)) / GRID_SIZE;
const GRID_WIDTH = BOX_SIZE * GRID_SIZE + MARGIN * (GRID_SIZE - 1);
const SWAP_THRESHOLD = BOX_SIZE * 0.6;
const DRAG_HANDLE_SIZE = 20;

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

      if (closestIndex !== null && minDistance < SWAP_THRESHOLD && closestIndex !== item.index) {
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
            color={getTextColorBasedOnLuminance(item.color)}
          ></FontAwesome6>
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
};

const DraggableGridScreen: React.FC = () => {
  const [categories, setCategories] = useState<BoxData[]>([
    { id: 1, title: 'Ultra Category 1', color: '#A7B3F9', index: 0 },
    { id: 2, title: 'Awesome Group 2', color: '#F45D8E', index: 1 },
    { id: 3, title: 'Mega Set 3', color: '#2CDA91', index: 2 },
    { id: 4, title: 'Epic Collection 4', color: '#8A67BE', index: 3 },
    { id: 5, title: 'Super Type 5', color: '#E9C46A', index: 4 },
    { id: 6, title: 'Hyper Class 6', color: '#4ECDC4', index: 5 },
    { id: 7, title: 'Cool Variety 7', color: '#FF6B6B', index: 6 },
    { id: 8, title: 'Fantastic Kind 8', color: '#45B7D1', index: 7 },
    { id: 9, title: 'Amazing Section 9', color: '#98CE00', index: 8 },
    { id: 10, title: 'Extreme Assortment 10', color: '#FFA07A', index: 9 },
    { id: 11, title: 'Ultra Group 11', color: '#20B2AA', index: 10 },
    { id: 12, title: 'Mega Category 12', color: '#FF69B4', index: 11 },
    { id: 13, title: 'Super Collection 13', color: '#7B68EE', index: 12 },
    { id: 14, title: 'Epic Set 14', color: '#00FA9A', index: 13 },
    { id: 15, title: 'Awesome Type 15', color: '#FF4500', index: 14 },
    { id: 16, title: 'Hyper Variety 16', color: '#1E90FF', index: 15 },
    { id: 17, title: 'Cool Class 17', color: '#FFD700', index: 16 },
    { id: 18, title: 'Fantastic Section 18', color: '#8A2BE2', index: 17 },
    { id: 19, title: 'Amazing Kind 19', color: '#32CD32', index: 18 },
    { id: 20, title: 'Extreme Assortment 20', color: '#FF6347', index: 19 },
  ]);

  const onDragEnd = useCallback((fromIndex: number, toIndex: number | null) => {
    if (toIndex === null || toIndex === fromIndex) {
      return; // No swap needed
    }

    setCategories((prevCategories) => {
      const newCategories = [...prevCategories];
      newCategories[fromIndex] = prevCategories[toIndex];
      newCategories[toIndex] = prevCategories[fromIndex];
      console.log(fromIndex, toIndex);
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
  dragHandle: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: DRAG_HANDLE_SIZE,
    height: DRAG_HANDLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
});

export default DraggableGridScreen;
