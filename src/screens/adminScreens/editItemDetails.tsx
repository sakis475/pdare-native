import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
} from 'react-native';
import { Checkbox, Divider, RadioButton } from 'react-native-paper';
import { colors } from '../../core/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { Dropdown } from 'react-native-element-dropdown';
import { toast } from '../../core/utils';

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
          {/* <TextInput
            ref={refInput}
            style={[styles.header, styles.editableHeader]}
            onChangeText={setPropertyName}
            value={propertyName}
            autoFocus={true}
            onBlur={() => setIsEditing(false)} // Optionally stop editing when the user taps out of the input
            multiline={true}
          /> */}
          {/* {property.propertyType === 'singleselect' ? (
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
          )} */}
          <View style={{ padding: 5 }}>
            <Text>{property.propertyValue}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const ToggleSelectButton = () => {
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  const toggleSelectMode = () => {
    setIsMultiSelect(!isMultiSelect);
    toast(
      'info',
      `Changed to ${!isMultiSelect ? 'Multiple' : 'Single'} Property Select`,
      undefined,
      1500
    );
  };

  return (
    <TouchableOpacity onPress={toggleSelectMode} style={styles.selectTypeBtn}>
      <Icon name={isMultiSelect ? 'crop-square' : 'circle-outline'} size={30} color="white" />
    </TouchableOpacity>
  );
};

const EditPropertyName = ({ defaultText }: { defaultText: string }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [propertyName, setPropertyName] = useState(defaultText);

  const refInput = React.useRef(null);
  const toggleEditing = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Focus the input next frame
      setTimeout(() => {
        //@ts-ignore
        refInput.current?.focus();
      }, 100);
    }
  };

  const handleDelete = () => {
    // Handle delete action (e.g., clearing the property name)
  };

  const data = [
    { label: 'Item 1', value: '1' },
    { label: 'Item 2', value: '2' },
    { label: 'Item 3', value: '3' },
    { label: 'Item 4', value: '4' },
    { label: 'Item 5', value: '5' },
    { label: 'Item 6', value: '6' },
    { label: 'Item 7', value: '7' },
    { label: 'Item 8', value: '8' },
  ];
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  return (
    <View style={styles.headerContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 2 }}>
        <TouchableOpacity onPress={toggleEditing}>
          <Icon name={isEditing ? 'check' : 'pencil-box-outline'} size={33} />
        </TouchableOpacity>
        {isEditing ? (
          <View style={{ flex: 1 }}>
            <TextInput
              ref={refInput}
              style={[styles.header, styles.editableHeader]}
              onChangeText={setPropertyName}
              value={propertyName}
              autoFocus={true}
              onBlur={() => setIsEditing(false)} // Optionally stop editing when the user taps out of the input
              multiline={true}
            />
          </View>
        ) : (
          <TouchableOpacity onPress={toggleEditing} style={{ flex: 1 }}>
            <TextInput style={styles.header} editable={false} multiline={true}>
              {propertyName}{' '}
            </TextInput>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.trashIcon}>
        <View style={{ marginRight: 5 }}>
          <ToggleSelectButton></ToggleSelectButton>
        </View>
        <TouchableOpacity onPress={handleDelete}>
          <Icon name="trash-can-outline" size={33} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const EditItemDetails = ({ route }: any) => {
  const [itemDetails, setItemDetails]: Item[] = useState(route.params.item);

  return (
    <View style={styles.container}>
      <View style={{ flex: 1, paddingTop: 16 }}>
        <ScrollView style={styles.scrollContainer} persistentScrollbar={true}>
          {Object.keys(itemDetails.itemPropertiesGrouped).map((propertyName, index, array) => (
            <View key={propertyName}>
              {/* <View style={styles.headerContainer}>
                <TouchableOpacity>
                  <Icon name="pencil-box-outline" size={33}></Icon>
                </TouchableOpacity>
                <Text style={styles.header}>{propertyName}</Text>
              </View> */}
              <EditPropertyName defaultText={propertyName}></EditPropertyName>
              <UnifiedSelect
                itemPropertiesGrouped={itemDetails.itemPropertiesGrouped[propertyName]}
              ></UnifiedSelect>

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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0, // Optional: add space below the header
    justifyContent: 'space-between',
  },
  header: {
    flex: 1,
    fontSize: 18, // Increased font size for more prominence
    fontWeight: 'bold',
    marginLeft: 5,
    color: 'white',
  },
  editableHeader: {
    flex: 1,
    borderBottomWidth: 1, // Highlight the TextInput by giving it a bottom border
    borderColor: 'blue', // Color of the border
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
  trashIcon: {
    // Flex value ensures it does not grow or shrink, keeping its size constant

    flexDirection: 'row',
    alignItems: 'center',
  },
  selectTypeBtn: { alignItems: 'center' },
});

export default EditItemDetails;
