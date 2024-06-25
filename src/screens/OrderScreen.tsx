import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  PanResponder,
  PanResponderInstance,
  Animated,
} from 'react-native';

const SOUND_OF_SILENCE = ['hello', 'darkness', 'my', 'old', 'friend'];

const OrderScreen = () => {
  // const pan = useRef(new Animated.ValueXY()).current;

  // const panResponder = useRef(
  //   PanResponder.create({
  //     onMoveShouldSetPanResponder: () => true,
  //     onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }]),
  //     onPanResponderRelease: () => {
  //       pan.extractOffset();
  //     },
  //   })
  // ).current;

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Drag this box!</Text>
      {/* <Animated.View
        style={{
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        }}
        {...panResponder.panHandlers}
      >
        <View style={styles.box} />
      </Animated.View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: 'bold',
  },
  box: {
    height: 150,
    width: 150,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
});

export default OrderScreen;
