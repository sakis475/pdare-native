import React, { useState } from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CurrencyFormat } from '../CurrencyFormat';
import { ScreenNames, navigate } from '../../navigation/AppNavigator';

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
    color: '#fff', // White text color for the title
    fontWeight: 'bold', // Bold font weight for the title
    fontSize: 18, // Adjust the font size as necessary
    marginBottom: 4, // Space between the title and the subtitle
  },
  itemDetails: {
    color: '#aaa', // Lighter grey color for the subtitle, adjust as needed
    fontSize: 14, // Adjust the font size as necessary
  },
  textPressed: {
    opacity: 0.5, // Apply opacity when pressed
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333', // Dark background for the container
    borderRadius: 5, // Rounded corners for the container
    padding: 4,
  },
  button: {
    width: 45, // Width of the button
    height: 45, // Height of the button
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#555', // Slightly lighter color for buttons
    borderRadius: 6, // Rounded corners for the buttons
    marginHorizontal: 4, // Space between buttons
  },
  buttonText: {
    color: '#fff', // White text color
    fontSize: 24, // Larger font size for the text in the buttons
    fontWeight: 'bold', // Bold font weight
  },
});
