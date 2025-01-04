import React, { useState } from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { CurrencyFormat } from '../helpers/CurrencyFormat';
import { colors } from '../../core/theme';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { navigate, ScreenNames } from '../../navigation/navigationUtils';
import { catalogItemStyles } from './CatalogStyles';

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
        <TouchableOpacity
          style={[styles.button, styles.smallButton]}
          onPress={handleAddNewItemPress}
          activeOpacity={0.6}
        >
          <Entypo name="chevron-right" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = catalogItemStyles;
