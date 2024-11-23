import React, { useState } from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { CurrencyFormat } from '../helpers/CurrencyFormat';
import { colors } from '../../core/theme';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { navigate, ScreenNames } from '../../navigation/navigationUtils';

export function CatalogItemEditable({ item }: { item: ItemReq }) {
  const [isPressedIn, setIsPressedIn] = useState(false);

  const handleAddNewItemPress = () => {
    navigate(ScreenNames.ManageItemDetailsScreen, { item });
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={[styles.itemTitle, isPressedIn ? styles.textPressed : null]}>
          {item.title}
        </Text>
        <CurrencyFormat value={item.cost} currency={'€'} />
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={handleAddNewItemPress} activeOpacity={0.6}>
          <Entypo name="chevron-right" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  textPressed: {
    opacity: 0.5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Space between buttons
  },
  button: {
    width: 33,
    height: 33,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightGrey,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: '#FF3B30', // Red color for delete button
  },
});
