import React, { useState } from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CurrencyFormat } from '../helpers/CurrencyFormat';
import { ScreenNames, navigate } from '../../navigation/AppNavigator';
import { colors } from '../../core/theme';

export function CatalogItemAdd({ item }: { item: ItemReq }) {
  const [isPressedIn, setIsPressedIn] = useState(false);

  const handleAddNewItemPress = () => {
    navigate(ScreenNames.ItemDetailsScreen, { item });
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={[styles.itemTitle, isPressedIn ? styles.textPressed : null]}>
          {item.title}
        </Text>
        <CurrencyFormat value={item.cost} currency={'€'}></CurrencyFormat>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleAddNewItemPress} activeOpacity={0.6}>
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
  },
  textContainer: {
    flex: 1, // Take up as much space as possible on the left side
    justifyContent: 'center',
  },
  itemTitle: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  textPressed: {
    opacity: 0.5, // Apply opacity when pressed
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlack, // Dark background for the container
    borderRadius: 5, // Rounded corners for the container
    padding: 4,
  },
  button: {
    width: 33, // Width of the button
    height: 33, // Height of the button
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGrey, // Slightly lighter color for buttons
    borderRadius: 6, // Rounded corners for the buttons
    marginHorizontal: 4, // Space between buttons
  },
  buttonText: {
    color: colors.white, // White text color
    fontSize: 24, // Larger font size for the text in the buttons
    fontWeight: 'bold', // Bold font weight
  },
});
