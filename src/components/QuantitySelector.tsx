import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TouchableHighlight } from 'react-native';
import { colors } from '../core/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const QuantitySelector = (props: any) => {
  console.log(props);
  const [quantity, setQuantity] = useState(props.quantity || 1); // Assuming the initial quantity is 2 as in the image
  const [showDeleteBtn, setShowDeleteBtn] = useState(false);
  const handleIncrement = () => {
    if (showDeleteBtn) {
      setShowDeleteBtn(false);
    } else {
      props.quantityChange(quantity + 1);
      setQuantity((prevQuantity: number) => prevQuantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      props.quantityChange(quantity - 1);
      setQuantity((prevQuantity: number) => prevQuantity - 1);
    } else if (quantity === 1) {
      setShowDeleteBtn(true);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleDecrement} activeOpacity={0.6}>
        {showDeleteBtn ? (
          <Icon name="trash-can-outline" size={27} color={colors.danger} />
        ) : (
          <Text style={styles.buttonText}>-</Text>
        )}
      </TouchableOpacity>
      <View style={styles.quantityContainer}>
        <Text style={styles.quantityText}>{quantity}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleIncrement} activeOpacity={0.6}>
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkGrey, // Dark background
    borderRadius: 5, // Rounded corners for the entire container
    // marginTop: 5,
    paddingHorizontal: 8,
  },
  button: {
    width: 45, // Width of the button, adjust as needed
    height: 45, // Height of the button, adjust as needed
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#555', // Slightly lighter color for buttons
    borderRadius: 6, // Rounded corners for the buttons
  },
  buttonText: {
    color: '#fff', // White text color
    fontSize: 24, // Larger font size for the text in the buttons
    fontWeight: 'bold', // Bold font weight
  },
  quantityContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10, // Rounded corners for the quantity text background
    minWidth: 32,
  },
  quantityText: {
    color: '#fff', // White text color
    fontSize: 18, // Adjusted font size for quantity text
  },
});

export default QuantitySelector;
