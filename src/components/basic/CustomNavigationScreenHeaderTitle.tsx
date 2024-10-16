import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { colors } from '../../core/theme';

const CustomNavigationScreenHeaderTitle = ({ title, bold }: any) => {
  const { width } = useWindowDimensions(); // Get the width of the screen

  return (
    <View style={[styles.headerTitleContainer, { maxWidth: width - 80 }]}>
      <Text style={[styles.headerTitle, bold ? { fontWeight: 'bold' } : null]} numberOfLines={0}>
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
    color: colors.white,
    fontSize: 18,
    textAlign: 'center',
  },
});

export default CustomNavigationScreenHeaderTitle;
