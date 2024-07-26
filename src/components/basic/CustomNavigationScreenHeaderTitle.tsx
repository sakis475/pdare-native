import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';

const CustomNavigationScreenHeaderTitle = ({ title }: any) => {
  const { width } = useWindowDimensions(); // Get the width of the screen

  return (
    <View style={[styles.headerTitleContainer, { maxWidth: width - 80 }]}>
      <Text style={styles.headerTitle} numberOfLines={0}>
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10, // Add some padding to the left and right
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default CustomNavigationScreenHeaderTitle;
