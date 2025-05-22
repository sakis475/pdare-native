import React, { useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { CurrencyFormat } from '../helpers/CurrencyFormat';
import { navigate, ScreenNames } from '../../navigation/navigationUtils';
import { catalogItemStyles } from './CatalogStyles';
import { ChevronRightIcon } from '../basic/Icons';
import { ItemReq } from '../../types/basic.types';

export function CatalogItemEditable({ item }: { item: ItemReq }) {
  const [isPressedIn, setIsPressedIn] = useState(false);

  const handleAddNewItemPress = () => {
    navigate(ScreenNames.ManageItemDetailsScreen, { item });
  };

  return (
    <TouchableOpacity
      style={[styles.container]}
      onPress={handleAddNewItemPress}
      activeOpacity={0.6}
    >
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
            <ChevronRightIcon size={20}></ChevronRightIcon>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
const styles = catalogItemStyles;
