import React, { useEffect, useRef, useState } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
import { CurrencyFormat } from '../helpers/CurrencyFormat';
import { ScreenNames, navigate } from '../../navigation/AppNavigator';
import QuantitySelector from '../helpers/QuantitySelector';
import { removeItemOfTemp, updateQuantityOfTempItem } from '../../helpers/orderStorage';
import { Divider } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export function CatalogItemAdded({
  item,
  refreshList,
  onItemPress,
}: {
  item: ItemReq;
  refreshList: any;
  onItemPress: any;
}) {
  const [showDivider, setShowDivider] = useState(true);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const [measuredHeight, setMeasuredHeight] = useState(0);

  const [isTap, setIsTap] = useState(false);

  if (!item.quantity) {
    item.quantity = 1;
  }

  const [totalCost, setTotalCost] = useState(item.cost * item.quantity);

  const handleItemDetailsUpdate = () => {
    navigate(ScreenNames.ItemDetailsScreen, { item, isUpdate: true });
  };

  const onLayout = (event: any) => {
    const { height: layoutHeight } = event.nativeEvent.layout;
    if (measuredHeight === 0) {
      setMeasuredHeight(layoutHeight);
      Animated.timing(animatedHeight, {
        toValue: layoutHeight,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }
  };

  useEffect(() => {
    setMeasuredHeight(0);
  }, [item]);

  let allProperties: ItemProperty[] = [];
  for (const propertyName of Object.keys(item.itemPropertiesGrouped)) {
    const propertyGroupSelected = (item.itemPropertiesGrouped as ItemPropertiesGrouped)[
      propertyName
    ].filter((e) => e.selected);
    allProperties = allProperties.concat(propertyGroupSelected);
  }

  const handleQuantityUpdate = (newQuantity: number) => {
    setTotalCost(item.cost * newQuantity);
    updateQuantityOfTempItem(newQuantity, item.newItemId as number);
  };

  const handleRemoveItem = async () => {
    setShowDivider(false);
    Animated.timing(animatedHeight, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start(async () => {
      await removeItemOfTemp(item.newItemId as number);
      refreshList();
    });
  };

  return (
    <View>
      <Animated.View
        key={item.newItemId} // Add key to force re-render
        style={[
          styles.container,
          { height: measuredHeight === 0 ? 'auto' : animatedHeight, opacity: isTap ? 0.5 : 1 },
        ]}
        onLayout={onLayout}
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
      {showDivider ? <Divider style={{ marginVertical: 8 }}></Divider> : null}
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
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
    paddingVertical: 1,
  },
  itemDetails: {
    color: '#aaa',
    fontSize: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 5,
    padding: 4,
  },
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#555',
    borderRadius: 6,
    marginHorizontal: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
