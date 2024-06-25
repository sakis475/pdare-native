import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { Checkbox, Divider, RadioButton } from 'react-native-paper';
import { colors } from '../core/theme';

const UnifiedSelect = ({ itemPropertiesGrouped }: { itemPropertiesGrouped: ItemProperty[] }) => {
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 4,
      marginLeft: 20, // Indentation for the options
    },
  });

  const [selectedId, setSelectedId] = useState<number | null>(null); // For radio buttons
  const [checkedStates, setCheckedStates] = useState<{ [key: number]: boolean }>({}); // For checkboxes

  const handleSelectChange = (id: number, selectType: 'singleselect' | 'multiselect') => {
    if (selectType === 'singleselect') {
      setSelectedId(id); // Set the selected ID for radio buttons
    } else if (selectType === 'multiselect') {
      setCheckedStates((prevStates) => ({
        ...prevStates,
        [id]: !prevStates[id],
      })); // Toggle the checked state for checkboxes
    }
  };

  return (
    <View>
      {itemPropertiesGrouped.map((property) => (
        <TouchableOpacity
          key={property.id}
          style={styles.container}
          onPress={() => handleSelectChange(property.id, property.propertyType)}
          activeOpacity={0.8}
        >
          {property.propertyType === 'singleselect' ? (
            <RadioButton
              value={property.propertyValue}
              status={selectedId === property.id ? 'checked' : 'unchecked'}
              color={'#6495ED'}
              onPress={() => handleSelectChange(property.id, property.propertyType)}
            />
          ) : (
            <Checkbox
              status={checkedStates[property.id] ? 'checked' : 'unchecked'}
              color={'#6495ED'}
              onPress={() => handleSelectChange(property.id, property.propertyType)}
            />
          )}
          <Text>{property.propertyValue}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const ItemDetails = ({ route }: any) => {
  const [itemDetails, setItemDetails]: ItemReq[] = useState(route.params.item);
  return (
    <View style={styles.container}>
      <View style={{ flex: 1, paddingTop: 16 }}>
        <ScrollView style={styles.scrollContainer} persistentScrollbar={true}>
          {Object.keys(itemDetails.itemPropertiesGrouped).map((propertyName, index, array) => (
            <View key={propertyName}>
              <Text style={styles.header}>{propertyName}</Text>
              {/* <UnifiedSelect
                // itemPropertiesGrouped={itemDetails.itemPropertiesGrouped[propertyName]}
              ></UnifiedSelect> */}

              {index !== array.length - 1 && <Divider style={{ marginVertical: 8 }} />}
            </View>
          ))}
        </ScrollView>
        <View style={styles.addItemContainer}>
          <TouchableOpacity style={styles.addItemBtn}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Προσθήκη</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2F2F2F',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 20, // Increased font size for more prominence
    fontWeight: 'bold',
    marginBottom: 20, // Optional: add space below the header
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    marginLeft: 20, // Indentation for the checkbox options
  },
  addItemContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.darkGrey,
  },
  addItemBtn: {
    backgroundColor: 'blue',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
});

export default ItemDetails;
