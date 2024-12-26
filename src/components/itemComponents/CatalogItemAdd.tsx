import React, { useState } from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { CurrencyFormat } from '../helpers/CurrencyFormat';
import { colors } from '../../core/theme';
import { navigate, ScreenNames } from '../../navigation/navigationUtils';
import { ChevronRightIcon, PlusIcon } from '../basic/Icons';

export function CatalogItemAdd({
  item,
  handleAddNewItemPress = () => {},
}: {
  item: ItemReq;
  handleAddNewItemPress?: any;
}) {
  const [isPressedIn, setIsPressedIn] = useState(false);

  const handleGoToDetails = () => {
    navigate(ScreenNames.ItemDetailsScreen, { item });
  };

  const handleAddBtn = () => {
    if (handleAddNewItemPress) {
      handleAddNewItemPress(item);
    }
  };

  return (
    <View style={[styles.container, item.quantity > 0 && { backgroundColor: colors.blue }]}>
      <View style={styles.textContainer}>
        <Text style={[styles.itemTitle, isPressedIn ? styles.textPressed : null]}>
          {item.title}
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <CurrencyFormat value={item.cost} currency={'€'}></CurrencyFormat>
          {item.quantity && (
            <Text style={{ color: colors.white, fontSize: 16 }}> x {item.quantity}</Text>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleAddBtn} activeOpacity={0.6}>
        <PlusIcon size={10} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleGoToDetails} activeOpacity={0.6}>
        <ChevronRightIcon size={20} />
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
    padding: 1,
    borderRadius: 2,
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
