import React, { useState } from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CurrencyFormat } from '../helpers/CurrencyFormat';
import { ScreenNames, navigate } from '../../navigation/AppNavigator';
import { colors } from '../../core/theme';

export function CatalogItemEditable({ item }: { item: ItemReq }) {
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
    color: colors.white, // White text color for the title
    fontWeight: 'bold', // Bold font weight for the title
    fontSize: 18, // Adjust the font size as necessary
    marginBottom: 4, // Space between the title and the subtitle
  },
  itemDetails: {
    color: colors.lighterGrey, // Lighter grey color for the subtitle, adjust as needed
    fontSize: 14, // Adjust the font size as necessary
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
    width: 45, // Width of the button
    height: 45, // Height of the button
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.slightlyLighterGrey, // Slightly lighter color for buttons
    borderRadius: 6, // Rounded corners for the buttons
    marginHorizontal: 4, // Space between buttons
  },
  buttonText: {
    color: colors.white, // White text color
    fontSize: 24, // Larger font size for the text in the buttons
    fontWeight: 'bold', // Bold font weight
  },
});
