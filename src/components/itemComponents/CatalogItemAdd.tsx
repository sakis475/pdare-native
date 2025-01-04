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
        <View style={{ flexDirection: 'row' }}>
          <CurrencyFormat value={item.cost} currency={'€'}></CurrencyFormat>
          {item.quantity && (
            <Text style={{ color: colors.white, fontSize: 16 }}> x {item.quantity}</Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        onPress={handleAddBtn}
        activeOpacity={0.6}
        style={[
          styles.button,
          styles.smallButton,
          disableInstantAdd && styles.buttonDisabled, // Add disabled style to button
        ]}
        disabled={disableInstantAdd}
      >
        <PlusIcon size={10} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.smallButton]}
        onPress={handleGoToDetails}
        activeOpacity={0.6}
      >
        <ChevronRightIcon size={20} />
      </TouchableOpacity>
    </View>
  );
}

const styles = catalogItemStyles;
