import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Text, View, TouchableOpacity, Animated } from 'react-native';
import { CurrencyFormat } from '../helpers/CurrencyFormat';
import QuantitySelector from '../helpers/QuantitySelector';
import { removeItemOfTemp, updateQuantityOfTempItem } from '../../helpers/storage/orderStorage';
import { navigate, ScreenNames } from '../../navigation/navigationUtils';
import _ from 'lodash';
import { catalogItemStyles } from './CatalogStyles';
import { CommentIcon, EditIcon } from '../basic/Icons';
import { ItemPropertiesGrouped, ItemProperty, ItemReq } from '../../types/basic.types';

export function CatalogItemAdded({
  item,
  refreshList,
  onItemPress,
}: {
  item: ItemReq;
  refreshList: any;
  onItemPress: any;
}) {
  const animatedOpacity = useRef(new Animated.Value(1)).current;
  const [isTap, setIsTap] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity || 1);
  const [totalCost, setTotalCost] = useState(item.cost * item.quantity);
  const updateInProgress = useRef(false);
  useEffect(() => {
    setQuantity(item.quantity || 1);
    setTotalCost(item.cost * (item.quantity || 1));
  }, [item.quantity, item.cost]);

  const handleItemDetailsUpdate = useCallback(() => {
    navigate(ScreenNames.ItemDetailsScreen, { item, isUpdate: true });
  }, [item]);

  const allProperties = Object.keys(item.itemPropertiesGrouped).reduce(
    (acc: ItemProperty[], propertyName) => {
      const propertyGroupSelected = (item.itemPropertiesGrouped as ItemPropertiesGrouped)[
        propertyName
      ].filter((e) => e.selected);
      return acc.concat(propertyGroupSelected);
    },
    []
  );

  const handleQuantityUpdate = useCallback(
    async (newQuantity: number) => {
      if (updateInProgress.current) return;

      updateInProgress.current = true;
      setTotalCost(item.cost * newQuantity);

      try {
        await updateQuantityOfTempItem(newQuantity, item.newItemId as string);
        setQuantity(newQuantity);
      } catch (error) {
        console.error('Error updating quantity:', error);
      } finally {
        updateInProgress.current = false;
      }
    },
    [item.cost, item.newItemId]
  );

  const handleRemoveItem = useCallback(async () => {
    Animated.timing(animatedOpacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start(async () => {
      try {
        await removeItemOfTemp(item.newItemId as string);
        refreshList();
      } catch (error) {
        console.error('Error removing item:', error);
      }
    });
  }, [animatedOpacity, item.newItemId, refreshList]);

  const handlePress = useCallback(() => {
    setIsTap(true);
    setTimeout(() => {
      setIsTap(false);
      handleItemDetailsUpdate();
    }, 100);
    onItemPress();
  }, [handleItemDetailsUpdate, onItemPress]);

  return (
    <View>
      <Animated.View
        key={item.newItemId}
        style={[styles.container, { opacity: isTap ? 0.5 : animatedOpacity }]}
      >
        <View style={styles.textContainer}>
          <TouchableOpacity onPress={handlePress} activeOpacity={1}>
            <Text style={styles.itemTitle}>
              <EditIcon size={14} /> {item.title}
            </Text>
          </TouchableOpacity>
          <View>
            <Animated.View style={{ justifyContent: 'center' }}>
              {allProperties.length > 0 && (
                <Text style={styles.itemDetails}>
                  {allProperties.map((e) => e.propertyValue).join(', ')}
                </Text>
              )}
              {item.comment && (
                <Text
                  style={[
                    styles.itemDetails,
                    { fontStyle: 'italic', justifyContent: 'center', alignItems: 'center' },
                  ]}
                >
                  <CommentIcon></CommentIcon>
                  {' ' + item.comment}
                </Text>
              )}
              <CurrencyFormat value={totalCost} currency={'€'} fontSize={12} />
            </Animated.View>
          </View>
        </View>
        <QuantitySelector
          quantity={quantity}
          quantityChange={handleQuantityUpdate}
          removeItem={handleRemoveItem}
        />
      </Animated.View>
    </View>
  );
}

const styles = catalogItemStyles;
