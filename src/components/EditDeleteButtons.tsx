import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AlertWithOptions, toast } from '../core/utils';
import { colors } from '../core/theme';
import * as Requests from '../helpers/requests';

const EditDeleteButtons = ({ item }: { item: Item }) => {
  const handleEdit = () => {
    console.log('Edit action triggered');
    // Add your edit functionality here
  };

  const handleDelete = (item: Item) => {
    return AlertWithOptions(
      'Permanent Delete',
      `Are you sure you want to permanently delete item: \n\n *${item.title}*`,
      () => {
        deleteItem(item);
      },
      () => null,
      'Delete'
    );

    // Add your delete functionality here
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleEdit} activeOpacity={0.6}>
        <Icon name="edit" size={24} color={'#c8c6ff'} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleDelete(item)}
        activeOpacity={0.6}
      >
        <Icon name="delete" size={24} color={'#ffc4c4'} />
      </TouchableOpacity>
    </View>
  );
};

const deleteItem = async (item: Item) => {
  try {
    await Requests.deleteRequest('/items/disableMany', {
      itemIds: [item.id],
    });
    toast('success', 'Item Succesfully Deleted', undefined, 2000);
  } catch (error) {
    toast('error', 'Could not delete item');
  }
};

const styles = StyleSheet.create({
  container: {
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

export default EditDeleteButtons;
