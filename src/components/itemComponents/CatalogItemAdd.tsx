import React, { useState } from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { CurrencyFormat } from '../helpers/CurrencyFormat';
import { colors } from '../../core/theme';
import { navigate, ScreenNames } from '../../navigation/navigationUtils';
import { ChevronRightIcon, PlusIcon } from '../basic/Icons';
import { catalogItemStyles } from './CatalogStyles';

export function CatalogItemAdd({
  item,
  handleAddNewItemPress = () => {},
  disableInstantAdd = false,
}: {
  item: ItemReq;
  handleAddNewItemPress?: any;
  disableInstantAdd?: boolean;
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
        <View style={styles.priceContainer}>
          <CurrencyFormat value={item.cost} currency="€" />
          {item.quantity > 0 && (
            <Text style={styles.quantityText}>
              {' x '}
              {item.quantity}
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.smallButton]}
        onPress={handleGoToDetails}
        activeOpacity={0.6}
      >
        <PlusIcon size={10} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  ...catalogItemStyles,
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    color: colors.white,
    fontSize: 16,
  },
});
