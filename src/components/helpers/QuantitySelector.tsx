import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TouchableHighlight } from 'react-native';
import { colors } from '../../core/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AlertWithOptions } from '../../core/utils';

const QuantitySelector = (props: any) => {
  const [quantity, setQuantity] = useState(props.quantity || 1); // Assuming the initial quantity is 2 as in the image
  const [showDeleteBtn, setShowDeleteBtn] = useState(false);

  let trashIconTimer: NodeJS.Timeout;

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
    } else if (showDeleteBtn) {
      clearTimeout(trashIconTimer);

      AlertWithOptions(
        'Remove',
        'Remove Item From List?',
        () => {
          props.removeItem();
          setShowDeleteBtn(false);
        },
        () => {
          setShowDeleteBtn(false);
        }
      );
    } else if (quantity === 1) {
      setShowDeleteBtn(true);
    }
  };

  useEffect(() => {
    if (showDeleteBtn) {
      trashIconTimer = setTimeout(() => {
        setShowDeleteBtn(false);
      }, 3000);
    }
    return () => clearTimeout(trashIconTimer); // Cleanup the timer when the component unmounts or showDeleteBtn changes
  }, [showDeleteBtn]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleDecrement} activeOpacity={0.6}>
        {showDeleteBtn ? (
          <Icon name="trash-can-outline" size={22} color={colors.danger} />
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
    width: 33, // Width of the button, adjust as needed
    height: 33, // Height of the button, adjust as needed
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#555', // Slightly lighter color for buttons
    borderRadius: 6, // Rounded corners for the buttons
  },
  buttonText: {
    color: '#fff', // White text color
    fontSize: 20, // Larger font size for the text in the buttons
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
    fontSize: 14, // Adjusted font size for quantity text
  },
});

export default QuantitySelector;
