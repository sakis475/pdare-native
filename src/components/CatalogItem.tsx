import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  View,
  Touchable,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import QuantitySelector from './QuantitySelector'; // Make sure the path is correct
import EditDeleteButtons from './EditDeleteButtons';

export function CatalogItem({ item, type }: { item: any; type: 'Use' | 'Manage' }) {
  const navigation = useNavigation();

  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  // Function to handle item press
  const handlePress = () => {
    if (type === 'Use') {
      //@ts-ignore
      navigation.navigate('itemDetails', { item });
    } else if (type === 'Manage') {
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={[styles.itemTitle, isPressed ? styles.textPressed : null]}>
            {item.title}
          </Text>
        </View>
        {type === 'Use' ? (
          <QuantitySelector initialQuantity={1} />
        ) : (
          <EditDeleteButtons item={item} />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
  },
  textContainer: {
    flex: 1, // Take up as much space as possible on the left side
    justifyContent: 'center',
  },
  itemTitle: {
    color: '#fff', // White text color for the title
    fontWeight: 'bold', // Bold font weight for the title
    fontSize: 18, // Adjust the font size as necessary
    marginBottom: 4, // Space between the title and the subtitle
  },
  itemDetails: {
    color: '#aaa', // Lighter grey color for the subtitle, adjust as needed
    fontSize: 14, // Adjust the font size as necessary
  },
  textPressed: {
    opacity: 0.5, // Apply opacity when pressed
  },
});
