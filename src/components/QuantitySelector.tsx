import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TouchableHighlight } from 'react-native';

const QuantitySelector = (props: any) => {
  const [quantity, setQuantity] = useState(props.initialQuantity || 1); // Assuming the initial quantity is 2 as in the image

  const handleIncrement = () => {
    setQuantity((prevQuantity: number) => prevQuantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prevQuantity: number) => prevQuantity - 1);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleDecrement} activeOpacity={0.6}>
        <Text style={styles.buttonText}>-</Text>
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
    backgroundColor: '#222222', // Dark background
    borderRadius: 5, // Rounded corners for the entire container
    // marginTop: 5,
    padding: 4,
  },
  button: {
    width: 40, // Width of the button, adjust as needed
    height: 40, // Height of the button, adjust as needed
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
    // paddingHorizontal: 12, // Space on the sides of the quantity text
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#444', // Slightly different background color for quantity text
    // marginHorizontal: 4, // Margin between the text and buttons
    borderRadius: 10, // Rounded corners for the quantity text background
    minWidth: 32,
  },
  quantityText: {
    color: '#fff', // White text color
    fontSize: 16, // Adjusted font size for quantity text
  },
});

export default QuantitySelector;
