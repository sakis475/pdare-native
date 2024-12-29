import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../core/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface QuantitySelectorProps {
  quantity: number;
  quantityChange: (quantity: number) => void;
  removeItem: () => void;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity: propQuantity,
  quantityChange,
  removeItem,
}) => {
  const [quantity, setQuantity] = useState(propQuantity || 1);
  const [showDeleteBtn, setShowDeleteBtn] = useState(false);

  let trashIconTimer: NodeJS.Timeout;

  // Add useEffect to sync with prop changes
  useEffect(() => {
    setQuantity(propQuantity || 1);
  }, [propQuantity]);

  const handleIncrement = () => {
    if (showDeleteBtn) {
      setShowDeleteBtn(false);
    } else {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      quantityChange(newQuantity);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      quantityChange(newQuantity);
    } else if (showDeleteBtn) {
      clearTimeout(trashIconTimer);
      removeItem();
      setShowDeleteBtn(false);
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
    return () => clearTimeout(trashIconTimer);
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
    color: colors.white, // White text color
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
    color: colors.white, // White text color
    fontSize: 14, // Adjusted font size for quantity text
  },
});

export default QuantitySelector;
