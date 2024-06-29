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
import QuantitySelector from './helpers/QuantitySelector'; // Make sure the path is correct
import { AlertWithOptions, toast } from '../core/utils';
import * as Requests from '../helpers/requests';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { colors } from '../core/theme';
import { CurrencyFormat } from './helpers/CurrencyFormat';
import { SortButtons } from './SortButtons';

export function CatalogItem({
  item,
  type,
  onAction,
  disableDown,
  disableUp,
}: {
  item: any;
  type: 'Use' | 'Manage' | 'Deleted' | 'Sort';
  onAction: any;
  disableDown?: boolean;
  disableUp?: boolean;
}) {
  const navigation = useNavigation();

  const [isPressedIn, setIsPressedIn] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressedIn(true);
  };

  const handlePressOut = () => {
    setIsPressedIn(false);
  };

  // Function to handle item press
  const handlePress = () => {
    setIsPressed(true);
    if (type === 'Use') {
      //@ts-ignore
      navigation.navigate('itemDetails', { item });
    } else if (type === 'Manage') {
      //@ts-ignore
      navigation.navigate('editItemDetails', { item });
    }
  };

  const handleEdit = () => {
    console.log('Edit action triggered');
    handlePress();
    // Add your edit functionality here
  };

  const handleSort = (direction: 'up' | 'down') => {
    if (direction === 'down') {
      onAction('sortDown');
    } else {
      onAction('sortUp');
    }
  };

  return (
    // <TouchableWithoutFeedback
    //   onPress={handlePress}
    //   onPressIn={handlePressIn}
    //   onPressOut={handlePressOut}
    //   disabled={type === 'Deleted'}
    // >
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.itemTitle,
            isPressedIn ? styles.textPressed : null,
            type === 'Deleted' ? { color: colors.danger, textDecorationLine: 'line-through' } : {},
          ]}
        >
          {item.title}
        </Text>
        <CurrencyFormat value={item.cost} currency={'€'}></CurrencyFormat>
      </View>
      {type === 'Use' ? (
        <QuantitySelector initialQuantity={0} />
      ) : type === 'Manage' ? (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={handleEdit} activeOpacity={0.6}>
            <Icon name="edit" size={24} color={'#c8c6ff'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => onAction('delete')}
            activeOpacity={0.6}
          >
            <Icon name="delete" size={24} color={'#ffc4c4'} />
          </TouchableOpacity>
        </View>
      ) : type === 'Deleted' ? (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              console.log('undelete pressed');
              onAction('undelete');
            }}
            activeOpacity={0.6}
          >
            <FontAwesome5 name="undo" size={18} color={'white'} />
          </TouchableOpacity>
        </View>
      ) : type === 'Sort' ? (
        <SortButtons
          handleSort={handleSort}
          disableUp={disableUp}
          disableDown={disableDown}
        ></SortButtons>
      ) : null}
    </View>
    // </TouchableWithoutFeedback>
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
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333', // Dark background for the container
    borderRadius: 5, // Rounded corners for the container
    padding: 4,
  },
  button: {
    width: 40, // Width of the button
    height: 40, // Height of the button
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#555', // Slightly lighter color for buttons
    borderRadius: 6, // Rounded corners for the buttons
    marginHorizontal: 4, // Space between buttons
  },
});
