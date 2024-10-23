import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { colors } from '../../core/theme';
import { navigateBack } from '../../navigation/AppNavigator';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import PropertyTypeBottomSheet from '../../components/bottomSheets/PropertyTypeBottomSheet';
import { AlertWithOptions } from '../../core/utils';
import { Checkbox, RadioButton } from 'react-native-paper';

const AdminItemDetailsScreen = ({ route }: any) => {
  const [item, setItem] = useState<ItemReq>();
  const [editingPropertyName, setEditingPropertyName] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>('');
  const [originalPropertyNames, setOriginalPropertyNames] = useState<{ [key: string]: string }>({});
  const propertyTypeBottomSheetRef = useRef<{ openModal: () => void; closeModal: () => void }>(
    null
  );
  const [editingPropertyType, setEditingPropertyType] = useState<string | null>(null);

  useEffect(() => {
    const deepCopy = JSON.parse(JSON.stringify(route.params.item));
    deepCopy.itemPropertiesGrouped = Object.entries(deepCopy.itemPropertiesGrouped).map(
      ([key, value]: any) => {
        return [
          key,
          value.map((prop: ItemProperty) => ({
            ...prop,
            originalPropertyValue: prop.propertyValue,
            isEdited: false,
          })),
        ];
      }
    );
    setItem(deepCopy);
    // console.log(JSON.stringify(deepCopy));
    // Initialize originalPropertyNames
    const originals = Object.fromEntries(
      deepCopy.itemPropertiesGrouped.map(([key]: [string, any]) => [key, key])
    );
    setOriginalPropertyNames(originals);
  }, [route.params.item]);

  const handleSelectChange = (propertyName: string, updatedProperties: ItemProperty[]) => {
    if (!item) return;
    setItem((prevItem: any) => ({
      ...prevItem,
      itemPropertiesGrouped: prevItem.itemPropertiesGrouped.map(([key, value]: [string, any[]]) =>
        key === propertyName ? [key, updatedProperties] : [key, value]
      ),
    }));
  };

  const movePropertyGroup = (index: number, direction: 'up' | 'down') => {
    if (!item) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= (item.itemPropertiesGrouped as any).length) return;

    const newItemPropertiesGrouped = [...(item.itemPropertiesGrouped as any)];
    [newItemPropertiesGrouped[index], newItemPropertiesGrouped[newIndex]] = [
      newItemPropertiesGrouped[newIndex],
      newItemPropertiesGrouped[index],
    ];

    setItem((prevItem: any) => ({
      ...prevItem,
      itemPropertiesGrouped: newItemPropertiesGrouped,
    }));
  };

  const startEditing = (propertyName: string) => {
    setEditingPropertyName(propertyName);
    setEditedName(propertyName);
  };

  const handlePropertyNameEdit = () => {
    if (!item || !editingPropertyName) return;
    setItem((prevItem: any) => {
      const updatedItemPropertiesGrouped = prevItem.itemPropertiesGrouped.map(
        ([key, value]: [string, any[]]) =>
          key === editingPropertyName ? [editedName, value] : [key, value]
      );

      const itemPropertyNames = updatedItemPropertiesGrouped.map(([key]: [string, any]) => key);
      const duplicatePropertyNames = itemPropertyNames.filter(
        (item: any, index: number) => itemPropertyNames.indexOf(item) < index
      );
      if (duplicatePropertyNames.length) {
        AlertWithOptions(
          'Duplicate Name',
          'A property with this name already exists. Please choose a different name.',
          ...[, , ,],
          ''
        );
        return {
          ...prevItem,
        };
      }
      return {
        ...prevItem,
        itemPropertiesGrouped: updatedItemPropertiesGrouped,
      };
    });
    setEditingPropertyName(null);
  };

  const handlePropertyTypeChange = (newType: string) => {
    if (!item || !editingPropertyType) return;
    setItem((prevItem: any) => ({
      ...prevItem,
      itemPropertiesGrouped: prevItem.itemPropertiesGrouped.map(([key, value]: [string, any[]]) =>
        key === editingPropertyType
          ? [key, value.map((prop) => ({ ...prop, propertyType: newType }))]
          : [key, value]
      ),
    }));
    setEditingPropertyType(null);
    propertyTypeBottomSheetRef.current?.closeModal();
  };

  const TypeSelect = ({ propertyType }: any) => {
    return (
      <View>
        {propertyType === 'singleselect' ? (
          <View style={styles.itemContent}>
            <MaterialIcons name="radio-button-checked" size={20} color={colors.white} />
            <Text style={styles.text}>Μονό</Text>
          </View>
        ) : (
          <View style={styles.itemContent}>
            <MaterialIcons name="check-box" size={20} color={colors.white} />
            <Text style={styles.text}>Πολλαπλό</Text>
          </View>
        )}
      </View>
    );
  };

  const renderPropertyGroup = ({ item: [propertyName, properties], index }: any) => {
    const itemPropertyWillBeDeleted = !properties?.length;

    return (
      <View style={styles.propertyGroup}>
        <View style={styles.propertyGroupHeader}>
          {editingPropertyName === propertyName ? (
            <View style={styles.itemContainer}>
              <TouchableOpacity onPress={handlePropertyNameEdit} style={styles.editButton}>
                <MaterialIcons name="check" size={20} color="#fff" />
              </TouchableOpacity>
              <TextInput
                style={[styles.input, styles.editingInput]}
                value={editedName}
                onChangeText={setEditedName}
                onBlur={handlePropertyNameEdit}
                autoFocus
              />
            </View>
          ) : (
            <View
              style={[
                styles.itemContainer,
                {
                  justifyContent: 'space-between',
                  backgroundColor: itemPropertyWillBeDeleted ? colors.lightRed : null,
                },
              ]}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <TouchableOpacity
                  onPress={() => startEditing(propertyName)}
                  style={styles.editButton}
                  disabled={itemPropertyWillBeDeleted}
                >
                  <MaterialIcons name="edit" size={20} color="#fff" />
                </TouchableOpacity>
                <Text
                  style={[
                    styles.header,
                    propertyName !== originalPropertyNames[propertyName] && styles.editedInput,
                    itemPropertyWillBeDeleted && styles.deletedText,
                  ]}
                >
                  {propertyName}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setEditingPropertyType(propertyName);
                  propertyTypeBottomSheetRef.current?.openModal();
                }}
                style={styles.propertyTypeButton}
                disabled={itemPropertyWillBeDeleted}
              >
                <Text style={styles.propertyTypeText}>
                  <TypeSelect propertyType={properties?.[0]?.propertyType}></TypeSelect>
                </Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.reorderButtons}>
            <TouchableOpacity
              onPress={() => movePropertyGroup(index, 'up')}
              disabled={index === 0 || itemPropertyWillBeDeleted}
              style={[
                styles.reorderButton,
                (index === 0 || itemPropertyWillBeDeleted) && styles.disabledButton,
              ]}
            >
              <MaterialIcons name="arrow-upward" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => movePropertyGroup(index, 'down')}
              disabled={
                index === (item!.itemPropertiesGrouped as any).length - 1 ||
                itemPropertyWillBeDeleted
              }
              style={[
                styles.reorderButton,
                (index === (item!.itemPropertiesGrouped as any).length - 1 ||
                  itemPropertyWillBeDeleted) &&
                  styles.disabledButton,
              ]}
            >
              <MaterialIcons name="arrow-downward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.propertyGroupContent}>
          <UnifiedSelect
            itemPropertiesGrouped={properties}
            onSelectChange={(updatedProperties) =>
              handleSelectChange(propertyName, updatedProperties)
            }
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {item ? (
        <>
          <View style={{ flex: 1 }}>
            <FlatList
              data={item.itemPropertiesGrouped as any}
              renderItem={renderPropertyGroup}
              keyExtractor={([key]) => key}
            />
          </View>
          <View style={styles.addItemContainer}>
            <TouchableOpacity
              style={styles.addItemBtn}
              onPress={async () => {
                const itemToSave = {
                  ...item,
                  itemPropertiesGrouped: Object.fromEntries(item.itemPropertiesGrouped as any),
                };

                console.log(JSON.stringify(itemToSave), 'itemToSave');
                // navigateBack();
              }}
            >
              <Text style={styles.addItemBtnText}>Αποθήκευση</Text>
            </TouchableOpacity>
            <PropertyTypeBottomSheet
              ref={propertyTypeBottomSheetRef}
              currentType={editingPropertyType}
              onTypeChange={handlePropertyTypeChange}
            />
          </View>
        </>
      ) : (
        <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
      )}
    </View>
  );
};
interface UnifiedSelectProps {
  itemPropertiesGrouped: ItemProperty[];
  onSelectChange: (updatedProperties: ItemProperty[]) => void;
}

const UnifiedSelect: React.FC<UnifiedSelectProps> = ({ itemPropertiesGrouped, onSelectChange }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleEdit = (item: ItemProperty) => {
    setEditingId(item.id);
    setEditingValue(item.propertyValue);
  };

  const handleSaveEdit = () => {
    if (editingId !== null) {
      const updatedProperties = itemPropertiesGrouped.map((item) =>
        item.id === editingId
          ? {
              ...item,
              propertyValue: editingValue,
              isEdited: editingValue !== item.originalPropertyValue,
            }
          : item
      );
      onSelectChange(updatedProperties);
      setEditingId(null);
    }
  };

  const handleAddNew = () => {
    const newId = Math.max(...itemPropertiesGrouped.map((item) => item.id), 0) + 1;
    const newProperty: ItemProperty = {
      id: newId,
      propertyName: itemPropertiesGrouped?.[0]?.propertyName ?? 'multiselect',
      propertyValue: 'unnamed-property',
      propertyType: 'singleselect',
      isEnabled: true,
      orderGroup: null,
      orderItem: itemPropertiesGrouped?.length ?? 0,
      selected: false,
      isEdited: false,
    };
    onSelectChange([...itemPropertiesGrouped, newProperty]);
  };

  const handleDelete = (id: number) => {
    const updatedProperties = itemPropertiesGrouped.filter((item) => item.id !== id);
    onSelectChange(updatedProperties);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= itemPropertiesGrouped.length) return;

    const newProperties = [...itemPropertiesGrouped];
    [newProperties[index], newProperties[newIndex]] = [
      newProperties[newIndex],
      newProperties[index],
    ];

    onSelectChange(newProperties);
  };

  const renderItem = ({ item, index }: { item: ItemProperty; index: number }) => (
    <View style={styles.itemContainer}>
      <View style={styles.reorderButtons}>
        <TouchableOpacity
          onPress={() => moveItem(index, 'up')}
          disabled={index === 0}
          style={[styles.reorderButton, index === 0 && styles.disabledButton]}
        >
          <MaterialIcons name="arrow-upward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.itemContent}>
        {editingId === item.id ? (
          <>
            <TouchableOpacity onPress={handleSaveEdit} style={styles.editButton}>
              <MaterialIcons name="check" size={20} color="#fff" />
            </TouchableOpacity>
            <TextInput
              ref={inputRef}
              style={[styles.input, styles.editingInput]}
              value={editingValue}
              onChangeText={setEditingValue}
              onBlur={handleSaveEdit}
              autoFocus
            />
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
              <MaterialIcons name="edit" size={20} color="#fff" />
            </TouchableOpacity>

            {item.propertyType === 'singleselect' ? (
              <RadioButton.Android
                value={item.propertyValue}
                status={item.selected ? 'checked' : 'unchecked'}
                color={'#6495ED'}
                uncheckedColor={'#ffffff'}
                onPress={() => {}}
              />
            ) : (
              <Checkbox.Android
                status={item.selected ? 'checked' : 'unchecked'}
                color={'#6495ED'}
                uncheckedColor={'#ffffff'}
                onPress={() => {}}
              />
            )}

            <Text style={[styles.input, item.isEdited && styles.editedInput]}>
              {item.propertyValue}
            </Text>
          </>
        )}
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
          <MaterialIcons name="delete" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.reorderButtons}>
        <TouchableOpacity
          onPress={() => moveItem(index, 'down')}
          disabled={index === itemPropertiesGrouped.length - 1}
          style={[
            styles.reorderButton,
            index === itemPropertiesGrouped.length - 1 && styles.disabledButton,
          ]}
        >
          <MaterialIcons name="arrow-downward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={itemPropertiesGrouped}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString() + item.propertyValue}
      />
      <TouchableOpacity onPress={handleAddNew} style={styles.addButton}>
        <Text style={styles.addButtonText}>Add New Property</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2F2F2F',
  },
  propertyGroup: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  propertyGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 16,
    backgroundColor: colors.darkGrey,
  },
  propertyGroupContent: {
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    padding: 8,
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    padding: 3,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  addItemBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#ffffff',
  },
  editButton: {
    margin: 0,
    padding: 0,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  editingInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  editedInput: {
    color: colors.green,
  },
  reorderButtons: {
    flexDirection: 'row',
  },
  reorderButton: {
    paddingHorizontal: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  propertyTypeButton: {
    marginLeft: 10,
    padding: 5,
    borderRadius: 5,
  },
  propertyTypeText: {
    color: colors.white,
    fontSize: 12,
  },
  text: {
    fontSize: 16,
    color: colors.white,
  },
  deletedText: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    color: colors.white,
  },
});

export default AdminItemDetailsScreen;
