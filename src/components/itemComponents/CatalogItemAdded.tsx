import React, { useRef, useState } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
import { CurrencyFormat } from '../helpers/CurrencyFormat';
import { ScreenNames, navigate } from '../../navigation/AppNavigator';
import QuantitySelector from '../helpers/QuantitySelector';
import { removeItemOfTemp, updateQuantityOfTempItem } from '../../helpers/storage/orderStorage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../core/theme';

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

  if (!item.quantity) {
    item.quantity = 1;
  }

  const [totalCost, setTotalCost] = useState(item.cost * item.quantity);

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
          quantity={item.quantity}
          quantityChange={handleQuantityUpdate}
          removeItem={handleRemoveItem}
        ></QuantitySelector>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
    overflow: 'hidden',
    paddingHorizontal: 10,
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
    paddingVertical: 1,
  },
  itemDetails: {
    color: colors.lighterGrey,
    fontSize: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGrey,
    borderRadius: 5,
    padding: 4,
  },
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.slightlyLighterGrey,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  buttonText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
});
