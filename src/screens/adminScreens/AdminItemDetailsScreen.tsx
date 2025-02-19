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
import PropertyTypeBottomSheet from '../../components/bottomSheets/PropertyTypeBottomSheet';
import { AlertWithOptions, toast } from '../../core/utils';
import { Checkbox, FAB, RadioButton } from 'react-native-paper';
import { patchRequest } from '../../helpers/requests';
import { getItem } from '../../helpers/storage/orderStorage';
import { LoadingOverlay } from '../../components/basic/SavingOverlay';
import { SelectPatternModal } from './popupModals/SelectPatternModal';
import { useStrings } from '../../core/localization/languageContext';
import { EventEmitter, ITEMS_UPDATED } from '../../helpers/Sockets/EventEmitter';
import {
  CheckBoxChecked,
  ChevronDownIcon,
  ChevronUpIcon,
  EditIcon,
  RadioButtonChecked,
  RestoreIcon,
  TickBoxIcon,
  TrashIcon,
} from '../../components/basic/Icons';
import { ItemProperty, ItemReq, PropertyPattern } from '../../types/basic.types';
import _ from 'lodash';

const AdminItemDetailsScreen = ({ route }: any) => {
  const [item, setItem] = useState<ItemReq>(null);
  const [editingPropertyName, setEditingPropertyName] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>('');
  const [originalPropertyNames, setOriginalPropertyNames] = useState<{ [key: string]: string }>({});
  const propertyTypeBottomSheetRef = useRef<{ openModal: () => void; closeModal: () => void }>(
    null
  );
  const [editingPropertyType, setEditingPropertyType] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPatternModalVisible, setIsPatternModalVisible] = useState(false);

  const strings = useStrings();

  const getItemStorage = async () => {
    const deepCopy: any = await getItem(route.params.item.id);
    deepCopy.itemPropertiesGrouped = Object.entries(deepCopy.itemPropertiesGrouped).map(
      ([key, value]: any) => {
        return [
          key,
          value.map((prop: ItemProperty) => ({
            ...prop,
            originalPropertyValue: prop.propertyValue,
            isEdited: false,
            isDeleted: !prop.isEnabled, // Initialize isDeleted based on isEnabled
          })),
        ];
      }
    );
    setItem(deepCopy);

    const originals = Object.fromEntries(
      deepCopy.itemPropertiesGrouped.map(([key]: [string, any]) => [key, key])
    );
    setOriginalPropertyNames(originals);
  };

  useEffect(() => {
    const subscription = EventEmitter.addListener(ITEMS_UPDATED, getItemStorage);

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    setItem(null);
    getItemStorage();
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

    // Swap positions
    [newItemPropertiesGrouped[index], newItemPropertiesGrouped[newIndex]] = [
      newItemPropertiesGrouped[newIndex],
      newItemPropertiesGrouped[index],
    ];

    // Update orderGroup for all items in both moved groups
    const updatedPropertiesGrouped = newItemPropertiesGrouped.map(
      ([key, properties]: [string, ItemProperty[]], groupIndex: number) => {
        const updatedProperties = properties.map((prop) => ({
          ...prop,
          orderGroup: groupIndex, // Update orderGroup based on new position
        }));
        return [key, updatedProperties];
      }
    );

    setItem((prevItem: any) => ({
      ...prevItem,
      itemPropertiesGrouped: updatedPropertiesGrouped,
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
          key === editingPropertyName
            ? [
                editedName,
                value.map((prop) => ({
                  ...prop,
                  propertyName: editedName, // Update the propertyName in each property
                })),
              ]
            : [key, value]
      );

      const itemPropertyNames = updatedItemPropertiesGrouped.map(([key]: [string, any]) => key);
      const duplicatePropertyNames = itemPropertyNames.filter(
        (item: any, index: number) => itemPropertyNames.indexOf(item) < index
      );

      if (duplicatePropertyNames.length) {
        AlertWithOptions(
          strings.DUPLICATE_NAME_TITLE,
          strings.DUPLICATE_NAME_MESSAGE,
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
      itemPropertiesGrouped: prevItem.itemPropertiesGrouped.map(([key, value]: [string, any[]]) => {
        if (key === editingPropertyType) {
          // If switching to singleselect, ensure only one item remains selected
          if (newType === 'singleselect') {
            const selectedItems = value.filter((prop) => prop.selected);
            // If multiple items are selected, keep only the first one selected
            const updatedProperties = value.map((prop, index) => ({
              ...prop,
              propertyType: newType,
              selected: selectedItems.length > 0 ? prop.id === selectedItems[0].id : false,
            }));
            return [key, updatedProperties];
          } else {
            // If switching to multiselect, keep existing selections
            return [
              key,
              value.map((prop) => ({
                ...prop,
                propertyType: newType,
              })),
            ];
          }
        }
        return [key, value];
      }),
    }));
    setEditingPropertyType(null);
    propertyTypeBottomSheetRef.current?.closeModal();
  };

  const TypeSelect = ({ propertyType }: any) => {
    return (
      <View>
        {propertyType === 'singleselect' ? (
          <View style={styles.itemContent}>
            <RadioButtonChecked size={20} color={colors.white} />
          </View>
        ) : (
          <View style={styles.itemContent}>
            <CheckBoxChecked size={20} color={colors.white} />
          </View>
        )}
      </View>
    );
  };

  const handleAddPropertyGroup = () => {
    if (!item) return;

    // Create a default name for the new group
    let newGroupName = strings.CHOICE;
    let counter = 1;

    // Check if name exists and increment counter until we find a unique name
    while ((item.itemPropertiesGrouped as any).some(([key]: any) => key === newGroupName)) {
      counter++;
      newGroupName = `${strings.CHOICE} ${counter}`;
    }

    // Create a new property with default values
    const newProperty: ItemProperty = {
      propertyName: newGroupName,
      propertyValue: strings.CHOICE,
      propertyType: 'singleselect',
      selected: false,
      required: false,
      dependsOn: null,
      isEnabled: true,
      orderGroup: (item.itemPropertiesGrouped as any).length,
      orderItem: 0,
      originalPropertyValue: strings.CHOICE,
      isEdited: false,
    };

    setItem((prevItem) => {
      const newItem = {
        ...prevItem,
        itemPropertiesGrouped: [
          ...(prevItem.itemPropertiesGrouped as any),
          [newGroupName, [newProperty]],
        ],
      };

      return newItem;
    });
  };

  const handleDeletePropertyGroup = (propertyName: string) => {
    if (!item) return;

    setItem((prevItem: any) => ({
      ...prevItem,
      itemPropertiesGrouped: prevItem.itemPropertiesGrouped
        .map(([key, value]: [string, any[]]) => {
          if (key === propertyName) {
            if (value.find((e) => !e.id || e.id < 0)) {
              return [key, []];
            }
            return [
              key,
              value.map((prop) => ({
                ...prop,
                isDeletedGroup: !prop.isDeletedGroup,
              })),
            ];
          }
          return [key, value];
        })
        .filter((e: any) => e?.[1]?.length),
    }));
  };

  const handlePatternSelect = (pattern: PropertyPattern) => {
    if (!item) return;

    // Group the pattern properties by name
    const groupedProperties = pattern.itemProperties.reduce((acc, prop) => {
      const name = prop.propertyName;
      if (!acc[name]) {
        acc[name] = [];
      }
      acc[name].push({
        ...prop,
        originalPropertyValue: prop.propertyValue,
        isEdited: false,
        isDeleted: false,
        isEnabled: true,
      });
      return acc;
    }, {} as { [key: string]: ItemProperty[] });

    // Convert to array format and update item
    setItem((prevItem: any) => ({
      ...prevItem,
      itemPropertiesGrouped: Object.entries(groupedProperties).map(([key, value], groupIndex) => [
        key,
        value.map((prop, itemIndex) => ({
          ...prop,
          orderGroup: groupIndex,
          orderItem: itemIndex,
        })),
      ]),
    }));

    // Update original property names
    setOriginalPropertyNames(
      Object.fromEntries(Object.keys(groupedProperties).map((key) => [key, key]))
    );
  };

  const renderPropertyGroup = ({ item: [propertyName, properties], index }: any) => {
    const isDeleted = properties?.[0]?.isDeletedGroup || !properties?.length;

    return (
      <View style={[styles.propertyGroup, isDeleted && styles.deletedPropertyGroup]}>
        <View style={styles.propertyGroupHeader}>
          {editingPropertyName === propertyName ? (
            <View style={styles.itemContainer}>
              <TouchableOpacity onPress={handlePropertyNameEdit} style={styles.editButton}>
                <TickBoxIcon size={20}></TickBoxIcon>
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
                  backgroundColor: isDeleted ? colors.lightRed : null,
                },
              ]}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  marginLeft: 15,
                }}
              >
                <Text
                  style={[
                    styles.header,
                    (propertyName !== originalPropertyNames[propertyName] ||
                      properties.some((e: any) => !e.id || e.id < 0)) &&
                      styles.editedInput,
                    isDeleted && styles.deletedText,
                  ]}
                >
                  {propertyName}
                </Text>
              </View>
            </View>
          )}
          <View style={styles.reorderButtons}>
            <TypeSelect propertyType={properties?.[0]?.propertyType}></TypeSelect>
            <TouchableOpacity
              onPress={() => movePropertyGroup(index, 'up')}
              disabled={index === 0 || isDeleted}
              style={[styles.reorderButton, (index === 0 || isDeleted) && styles.disabledButton]}
            >
              <ChevronUpIcon size={20}></ChevronUpIcon>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => movePropertyGroup(index, 'down')}
              disabled={index === (item!.itemPropertiesGrouped as any).length - 1 || isDeleted}
              style={[
                styles.reorderButton,
                (index === (item!.itemPropertiesGrouped as any).length - 1 || isDeleted) &&
                  styles.disabledButton,
              ]}
            >
              <ChevronDownIcon size={20}></ChevronDownIcon>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.propertyGroupContent, isDeleted && styles.disabledContent]}>
          <UnifiedSelect
            itemPropertiesGrouped={properties}
            onSelectChange={(updatedProperties) =>
              handleSelectChange(propertyName, updatedProperties)
            }
            disabled={isDeleted}
            viewOnly={true}
          />
        </View>
      </View>
    );
  };

  const transformItemData = (inputItem: any): any => {
    const itemProperties = Object.entries(inputItem.itemPropertiesGrouped)
      .flatMap(([_, value]) => value)
      .map((prop: any) => {
        const obj = {
          propertyName: prop.propertyName,
          propertyType: prop.propertyType,
          propertyValue: prop.propertyValue,
          orderGroup: prop.orderGroup,
          orderItem: prop.orderItem,
          selected: !!prop.selected,
          isEnabled: prop.isDeleted || prop.isDeletedGroup ? false : true, // Consider both flags
        };

        if (prop.id > 0) {
          Object.assign(obj, { id: prop.id });
        }
        return obj;
      });

    return {
      id: inputItem.id,
      title: inputItem.title,
      description: inputItem.description,
      cost: inputItem.cost,
      orderItem: null,
      isEnabled: inputItem.isEnabled,
      category: {
        id: inputItem.category.id,
      },
      itemProperties,
    };
  };

  const reorderAllItems = (inputItem: any) => {
    // First ensure we're working with entries if we have an object
    const itemPropertiesEntries = Array.isArray(inputItem.itemPropertiesGrouped)
      ? inputItem.itemPropertiesGrouped
      : Object.entries(inputItem.itemPropertiesGrouped);

    // Update ordering
    const updatedGrouped = itemPropertiesEntries.map(
      ([key, properties]: [string, ItemProperty[]], groupIndex: number) => {
        const updatedProperties = properties.map((prop, itemIndex) => ({
          ...prop,
          orderGroup: groupIndex,
          orderItem: itemIndex,
        }));
        return [key, updatedProperties];
      }
    );

    return {
      ...inputItem,
      itemPropertiesGrouped: Object.fromEntries(updatedGrouped),
    };
  };

  const handleSave = async () => {
    if (!item) return;

    setIsSaving(true); // Show loading overlay
    try {
      const itemToSave = {
        ...item,
        itemPropertiesGrouped: Object.fromEntries(item.itemPropertiesGrouped as any),
      };

      const reorderedItem = reorderAllItems(itemToSave);
      const transformedData = transformItemData(reorderedItem);

      const response = await patchRequest('/items/save', [transformedData]);
      if (!response || !Array.isArray(response) || response.length === 0) {
        return;
      }

      const updatedItem = response.find((e) => e.id === item.id);
      if (!updatedItem) {
        return;
      }

      // Update local storage
      // await updateItem(updatedItem);

      //Re-load item
      // await getItemStorage();
      // // Process the response data

      // Show success message
      toast('success', strings.SUCCESS, strings.CHANGES_SAVED);

      // Optionally navigate back
      // navigateBack();
    } catch (error) {
      console.error('Save error:', error);
      toast('error', strings.ERROR, strings.SAVE_ERROR);
    } finally {
      setIsSaving(false); // Hide loading overlay
    }
  };

  const ListEmptyComponent = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{strings.NO_PATTERNS_ACTIONS}</Text>
      </View>
    );
  };

  // Modify the return statement to include the loading overlay
  return (
    <View style={styles.container}>
      {item === null ? (
        <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
      ) : (
        <>
          <View style={{ flex: 1 }}>
            <FlatList
              data={item.itemPropertiesGrouped as any}
              renderItem={renderPropertyGroup}
              keyExtractor={(item, index) => `group-${item[0]}-${index}`}
              contentContainerStyle={{ paddingBottom: 50 }}
              ListEmptyComponent={ListEmptyComponent}
            />
            <>
              <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => setIsPatternModalVisible(true)}
                color={colors.white}
                animated={false}
              />

              <SelectPatternModal
                visible={isPatternModalVisible}
                onDismiss={() => setIsPatternModalVisible(false)}
                onSelect={handlePatternSelect}
                category={item.category}
              />
            </>
          </View>

          <View style={styles.addItemContainer}>
            <TouchableOpacity style={styles.addItemBtn} onPress={() => handleSave()}>
              <Text style={styles.addItemBtnText}>{strings.SAVE_ALL}</Text>
            </TouchableOpacity>
            <PropertyTypeBottomSheet
              ref={propertyTypeBottomSheetRef}
              currentType={editingPropertyType}
              onTypeChange={handlePropertyTypeChange}
            />
          </View>

          {/* Add the loading overlay */}
          {isSaving && <LoadingOverlay />}
        </>
      )}
    </View>
  );
};
interface UnifiedSelectProps {
  itemPropertiesGrouped: ItemProperty[];
  onSelectChange: (updatedProperties: ItemProperty[]) => void;
  disabled: boolean;
  viewOnly?: boolean;
}

export const UnifiedSelect: React.FC<UnifiedSelectProps> = ({
  itemPropertiesGrouped,
  onSelectChange,
  disabled,
  viewOnly = false,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [newItemCounter, setNewItemCounter] = useState(0); // Add counter for generating unique IDs
  const inputRef = useRef<TextInput>(null);

  const strings = useStrings();

  // Reset counter when itemPropertiesGrouped changes completely
  useEffect(() => {
    if (itemPropertiesGrouped.length === 0) {
      setNewItemCounter(0);
    }
  }, [itemPropertiesGrouped]);

  const handleSelectionChange = (selectedItem: ItemProperty) => {
    let updatedProperties: ItemProperty[];

    if (selectedItem.propertyType === 'singleselect') {
      // For radio buttons: only one can be selected
      updatedProperties = itemPropertiesGrouped.map((item) => ({
        ...item,
        selected: item.id === selectedItem.id ? !item.selected : false,
      }));
    } else {
      // For checkboxes: multiple can be selected
      updatedProperties = itemPropertiesGrouped.map((item) => ({
        ...item,
        selected: item.id === selectedItem.id ? !item.selected : item.selected,
      }));
    }

    onSelectChange(updatedProperties);
  };

  const handleEdit = (item: ItemProperty) => {
    setEditingId(item.id);
    setEditingValue(item.propertyValue);
  };

  const handleSaveEdit = () => {
    if (editingId !== null) {
      // Check for duplicate names when editing
      const isDuplicate = itemPropertiesGrouped.some(
        (item) =>
          item.id !== editingId && item.propertyValue.toLowerCase() === editingValue.toLowerCase()
      );

      if (isDuplicate) {
        Alert.alert(strings.DUPLICATE_NAME_TITLE, strings.DUPLICATE_NAME_MESSAGE, [
          { text: strings.OK },
        ]);
        return;
      }

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

  const generateUniqueId = () => {
    // Generate a unique negative ID for new items
    const newId = -(Date.now() + newItemCounter);
    setNewItemCounter((prev) => prev + 1);
    return newId;
  };

  const handleAddNew = () => {
    // Base name for new property
    let baseName = strings.CHOICE;
    let counter = 1;
    let newPropertyValue = baseName;

    // Keep incrementing counter until we find a unique name
    while (
      itemPropertiesGrouped.some(
        (item) => item.propertyValue.toLowerCase() === newPropertyValue.toLowerCase()
      )
    ) {
      counter++;
      newPropertyValue = `${baseName} ${counter}`;
    }

    const newId = generateUniqueId();
    const newProperty: ItemProperty = {
      id: newId,
      propertyName: itemPropertiesGrouped?.[0]?.propertyName ?? 'multiselect',
      propertyValue: newPropertyValue,
      propertyType: itemPropertiesGrouped?.[0]?.propertyType ?? 'singleselect',
      isEnabled: true,
      orderGroup: null,
      orderItem: itemPropertiesGrouped?.length ?? 0,
      selected: false,
      isEdited: false,
      originalPropertyValue: newPropertyValue, // Add this to track changes
    };

    // Create a new array with the new property
    const updatedProperties = [...itemPropertiesGrouped, newProperty];
    onSelectChange(updatedProperties);

    // Set editing state for the new property
    setEditingId(newId);
    setEditingValue(newPropertyValue);
  };

  const handleDelete = (id: number) => {
    const updatedProperties = itemPropertiesGrouped.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          isDeleted: !item.isDeleted, // Individual property deletion flag
        };
      }
      return item;
    });
    onSelectChange(updatedProperties);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= itemPropertiesGrouped.length) return;

    const newProperties = [...itemPropertiesGrouped];

    // Swap positions
    [newProperties[index], newProperties[newIndex]] = [
      newProperties[newIndex],
      newProperties[index],
    ];

    // Update orderItem for all items to match their new positions
    const updatedProperties = newProperties.map((prop, idx) => ({
      ...prop,
      orderItem: idx,
    }));

    onSelectChange(updatedProperties);
  };

  const renderItem = ({ item, index }: { item: ItemProperty; index: number }) => {
    // Check both group and individual deletion status
    const isDeleted = item.isDeleted || item.isDeletedGroup;

    return (
      <View style={[styles.itemContainer, isDeleted && styles.deletedItem]}>
        <View style={styles.reorderButtons}>
          <TouchableOpacity
            onPress={() => moveItem(index, 'up')}
            disabled={index === 0 || isDeleted}
            style={[styles.reorderButton, (index === 0 || isDeleted) && styles.disabledButton]}
          >
            <ChevronUpIcon size={20}></ChevronUpIcon>
          </TouchableOpacity>
        </View>

        <View style={styles.itemContent}>
          {editingId === item.id ? (
            <>
              <TouchableOpacity onPress={handleSaveEdit} style={styles.editButton}>
                <TickBoxIcon size={20} color="#fff" />
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
              {!viewOnly && (
                <>
                  {item.propertyType === 'singleselect' ? (
                    <RadioButton.Android
                      value={item.propertyValue}
                      status={item.selected ? 'checked' : 'unchecked'}
                      color={'#6495ED'}
                      uncheckedColor={'#ffffff'}
                      onPress={() => handleSelectionChange(item)}
                      disabled={isDeleted}
                    />
                  ) : (
                    <Checkbox.Android
                      status={item.selected ? 'checked' : 'unchecked'}
                      color={'#6495ED'}
                      uncheckedColor={'#ffffff'}
                      onPress={() => handleSelectionChange(item)}
                      disabled={isDeleted}
                    />
                  )}
                  <TouchableOpacity
                    onPress={() => handleEdit(item)}
                    style={styles.editButton}
                    disabled={isDeleted}
                  >
                    <EditIcon size={20} color="#fff" />
                  </TouchableOpacity>
                </>
              )}

              <Text
                style={[
                  styles.input,
                  item.isEdited && styles.editedInput,
                  isDeleted && styles.deletedText,
                ]}
              >
                {item.propertyValue}
              </Text>
              {/* Only show delete button if group is not deleted */}
              {!viewOnly && !item.isDeletedGroup && (
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                  {item.isDeleted ? (
                    <RestoreIcon size={20} color={colors.green}></RestoreIcon>
                  ) : (
                    <TrashIcon size={20} color={colors.lightRed}></TrashIcon>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
        <View style={styles.reorderButtons}>
          <TouchableOpacity
            onPress={() => moveItem(index, 'down')}
            disabled={index === itemPropertiesGrouped.length - 1 || isDeleted}
            style={[
              styles.reorderButton,
              (index === itemPropertiesGrouped.length - 1 || isDeleted) && styles.disabledButton,
            ]}
          >
            <ChevronDownIcon size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, disabled && styles.disabledContainer]}>
      <FlatList
        data={itemPropertiesGrouped}
        renderItem={renderItem}
        keyExtractor={(item) => {
          // Handle both positive and negative IDs
          const id = item?.id ?? '';
          return `property-${id}-${item?.propertyValue}`;
        }}
      />
      {!viewOnly && (
        <TouchableOpacity onPress={handleAddNew} style={styles.addButton}>
          <Text style={styles.addButtonText}>{strings.ADD_NEW}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Required and used styles - core layout
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

  // Item-related styles
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

  // Text and input styles
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
  editingInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  editedInput: {
    color: colors.green,
  },
  deletedText: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    color: colors.white,
  },

  // Button styles
  addItemContainer: {
    paddingVertical: 8,
    backgroundColor: colors.darkGrey,
  },
  addItemBtn: {
    backgroundColor: 'blue',
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
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: colors.darkBlue,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },

  // Reorder controls
  reorderButtons: {
    flexDirection: 'row',
  },
  reorderButton: {
    paddingHorizontal: 5,
  },

  // Property type
  propertyTypeButton: {
    marginLeft: 10,
    padding: 5,
    borderRadius: 5,
  },
  propertyTypeText: {
    color: colors.white,
    fontSize: 12,
  },

  // State styles
  disabledButton: {
    opacity: 0.5,
  },
  deletedPropertyGroup: {
    opacity: 0.7,
  },
  disabledContent: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
  disabledContainer: {
    opacity: 0.5,
  },
  deletedItem: {
    opacity: 0.7,
    backgroundColor: colors.lightRed,
  },

  // FAB
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },

  emptyContainer: {
    marginTop: '70%',
  },
  emptyText: {
    color: colors.white,
    textAlign: 'center',
    fontSize: 14,
    padding: 20,
  },
});

export default AdminItemDetailsScreen;
