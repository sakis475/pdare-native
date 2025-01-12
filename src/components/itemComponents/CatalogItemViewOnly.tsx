import React, { useEffect, useRef, useState } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
import { CurrencyFormat } from '../helpers/CurrencyFormat';
import { removeItemOfTemp, updateQuantityOfTempItem } from '../../helpers/storage/orderStorage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../core/theme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { catalogItemStyles } from './CatalogStyles';

export function CatalogItemViewOnly({ item }: { item: ItemReq }) {
  if (!item.quantity) {
    item.quantity = 1;
  }

  const [totalCost, setTotalCost] = useState(item.cost * item.quantity);
  const [markAsDelete, setMarkAsDelete] = useState(!!item.markForDelete);

  let allProperties: ItemProperty[] = [];
  for (const propertyName of Object.keys(item.itemPropertiesGrouped)) {
    const propertyGroupSelected = (item.itemPropertiesGrouped as ItemPropertiesGrouped)[
      propertyName
    ].filter((e) => e.selected);
    allProperties = allProperties.concat(propertyGroupSelected);
  }

  useEffect(() => {
    setTotalCost(item.cost * item.quantity);
    setMarkAsDelete(!!item.markForDelete);
  }, [item]);

  return (
    <View>
      <View
        key={item.newItemId} // Add key to force re-render
        style={[styles.container]}
      >
        <View style={styles.textContainer}>
          <Text style={markAsDelete ? styles.itemTitleDeleted : styles.itemTitle}>
            {item.title}
          </Text>

          <View>
            <View style={{ justifyContent: 'center' }}>
              {allProperties.length > 0 ? (
                <Text style={markAsDelete ? styles.itemsDetailsDeleted : styles.itemDetails}>
                  {allProperties.map((e) => e.propertyValue).join(', ')}
                </Text>
              ) : null}
              {item.comment ? (
                <Text
                  style={[
                    markAsDelete ? styles.itemsDetailsDeleted : styles.itemDetails,
                    { fontStyle: 'italic' },
                  ]}
                >
                  {item.comment}
                </Text>
              ) : null}
              <CurrencyFormat value={totalCost} currency={'€'} fontSize={12}></CurrencyFormat>
            </View>
          </View>
        </View>
        <View style={styles.button}>
          <Text style={styles.buttonText}>x{item.quantity}</Text>
        </View>
      </View>
    </View>
  );
}
const styles = catalogItemStyles;
// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     flex: 1,
//     overflow: 'hidden',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//   },
//   textContainer: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   itemTitle: {
//     color: colors.lighterGrey,
//     fontWeight: 'bold',
//     fontSize: 14,
//     marginBottom: 4,
//     paddingVertical: 1,
//   },
//   itemTitleDeleted: {
//     color: colors.black,
//     textDecorationLine: 'line-through',
//     fontWeight: 'bold',
//     fontSize: 14,
//     marginBottom: 4,
//     paddingVertical: 1,
//   },
//   itemDetails: {
//     color: colors.lighterGrey,
//     fontSize: 12,
//   },
//   itemsDetailsDeleted: {
//     color: colors.black,
//     fontSize: 12,
//     textDecorationLine: 'line-through',
//   },
//   buttonsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: colors.white,
//     borderRadius: 5,
//     padding: 4,
//   },
//   button: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: colors.slightlyDarkerGrey,
//     borderRadius: 6,
//     marginHorizontal: 4,
//   },
//   buttonText: {
//     color: colors.white,
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });
