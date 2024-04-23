import React, { memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';

const Logo = () => (
  // <Image source={require("../../../assets/icon.png")} style={styles.image} />
  <View></View>
);

const styles = StyleSheet.create({
  image: {
    width: 128,
    height: 128,
    marginBottom: 12,
  },
});

export default memo(Logo);
