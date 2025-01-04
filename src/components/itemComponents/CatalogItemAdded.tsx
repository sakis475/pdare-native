import React, { useEffect, useRef, useState } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
import { CurrencyFormat } from '../helpers/CurrencyFormat';
import QuantitySelector from '../helpers/QuantitySelector';
import { removeItemOfTemp, updateQuantityOfTempItem } from '../../helpers/storage/orderStorage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../core/theme';
import { navigate, ScreenNames } from '../../navigation/navigationUtils';
import { catalogItemStyles } from './CatalogStyles';

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

  useEffect(() => {
    setQuantity(item.quantity || 1);
    setTotalCost(item.cost * (item.quantity || 1));
  }, [item.quantity, item.cost]);

  const handleItemDetailsUpdate = () => {
    navigate(ScreenNames.ItemDetailsScreen, { item, isUpdate: true });
  };

  let allProperties: ItemProperty[] = [];
  for (const propertyName of Object.keys(item.itemPropertiesGrouped)) {
    const propertyGroupSelected = (item.itemPropertiesGrouped as ItemPropertiesGrouped)[
      propertyName
    ].filter((e) => e.selected);
    allProperties = allProperties.concat(propertyGroupSelected);
  }

  const handleQuantityUpdate = (newQuantity: number) => {
    setTotalCost(item.cost * newQuantity);
    updateQuantityOfTempItem(newQuantity, item.newItemId as string);
  };

  const handleRemoveItem = async () => {
    Animated.timing(animatedOpacity, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start(async () => {
      await removeItemOfTemp(item.newItemId as string);
      refreshList();
    });
  };

  return (
    <View>
      <Animated.View
        key={item.newItemId} // Add key to force re-render
        style={[styles.container, { opacity: isTap ? 0.5 : animatedOpacity }]}
      >
        <View style={styles.textContainer}>
          <TouchableOpacity
            onPress={() => {
              setIsTap(true);
              setTimeout(() => {
                setIsTap(false);
                handleItemDetailsUpdate();
              }, 100);
              onItemPress();
            }}
            activeOpacity={1}
          >
            <Text style={styles.itemTitle}>
              <MaterialIcons name="edit" size={14} color={'#fff'} /> {item.title}
            </Text>
          </TouchableOpacity>
          <View>
            <Animated.View style={{ justifyContent: 'center' }}>
              {allProperties.length > 0 ? (
                <Text style={styles.itemDetails}>
                  {allProperties.map((e) => e.propertyValue).join(', ')}
                </Text>
              ) : null}
              {item.comment ? (
                <Text
                  style={[
                    styles.itemDetails,
                    { fontStyle: 'italic', justifyContent: 'center', alignItems: 'center' },
                  ]}
                >
                  <MaterialIcons name="insert-comment"></MaterialIcons>
                  {' ' + item.comment}
                </Text>
              ) : null}
              <CurrencyFormat value={totalCost} currency={'€'} fontSize={12}></CurrencyFormat>
            </Animated.View>
          </View>
        </View>

        <QuantitySelector
          quantity={quantity}
          quantityChange={handleQuantityUpdate}
          removeItem={handleRemoveItem}
        ></QuantitySelector>
      </Animated.View>
    </View>
  );
}
const styles = catalogItemStyles;
