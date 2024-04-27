import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions } from 'react-native';
import { BottomHalfSheet } from '../components/BottomHalfSheet';
import { FlashList } from '@shopify/flash-list';
const OrderScreen = () => {
  const [viewableItems, setViewableItems] = useState([]);
  const [something, setSomething] = useState<any>();
  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    console.log('Visible items:', viewableItems);
    setViewableItems(viewableItems.map((item: any) => item.item));
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50, // Item needs to be 50% visible
  };

  const x = { Καφές: 1, Κρέπες: 6, Σάντουϊτς: 10 };

  useEffect(() => {
    setSomething(x);
  }, []);

  return (
    <View style={styles.container}>
      <View style={{ height: 600, width: Dimensions.get('screen').width }}>
        <FlashList
          data={[...Array(20).keys()].map((i) => ({ key: `Item-${i}` }))}
          renderItem={({ item }) => (
            <View
              style={{
                height: 150,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
              }}
            >
              <Text>{item.key}</Text>
            </View>
          )}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          estimatedItemSize={20}
        />
      </View>

      <Text>{something?.Κρέπες}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  openButton: {
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  tableButton: {
    marginTop: 10,
    backgroundColor: 'lightgrey',
    padding: 10,
    borderRadius: 5,
  },
});

export default OrderScreen;
