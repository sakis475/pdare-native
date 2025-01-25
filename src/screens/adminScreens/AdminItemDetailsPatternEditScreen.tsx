import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
  Alert,
  Animated,
} from 'react-native';
import { colors } from '../../core/theme';
import PropertyTypeBottomSheet from '../../components/bottomSheets/PropertyTypeBottomSheet';
import { AlertWithOptions, toast } from '../../core/utils';
import { FAB } from 'react-native-paper';
import { patchRequest } from '../../helpers/requests';
import { LoadingOverlay } from '../../components/basic/SavingOverlay';
import { UnifiedSelect } from './AdminItemDetailsScreen';
import {
  getItemPropertyPatterns,
  setItemPropertyPatterns,
} from '../../helpers/storage/orderStorage';
import { strings } from '../../core/localization/strings';
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

const AdminItemDetailsPatternEditScreen = ({ route }: any) => {
  const [propertyGroups, setPropertyGroups] = useState<[string, ItemProperty[]][]>([]);
  const [editingPropertyName, setEditingPropertyName] = useState<string | null>(null);
  const [editedName, setEditedName] = useState<string>('');
  const [originalPropertyNames, setOriginalPropertyNames] = useState<{ [key: string]: string }>({});
  const propertyTypeBottomSheetRef = useRef<{ openModal: () => void; closeModal: () => void }>(
    null
  );
  const [editingPropertyType, setEditingPropertyType] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Add refs for FlatList and animation
  const flatListRef = useRef<FlatList>(null);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (flatListRef.current && propertyGroups.length > 0) {
      flatListRef.current.scrollToIndex({
        index: propertyGroups.length - 1,
        animated: true,
      });
    }
  };

  const getStorageItemPropertyPattern = async () => {
    const allPatterns = await getItemPropertyPatterns();

    const currentPattern: PropertyPattern = allPatterns.find(
      (e) => route.params?.pattern?.id === e.id
    );
    if (!currentPattern) return;
    const grouped = groupPropertiesByName(currentPattern.itemProperties);
    setPropertyGroups(Object.entries(grouped));

    const originals = Object.fromEntries(Object.keys(grouped).map((key) => [key, key]));
    setOriginalPropertyNames(originals);
  };

  useEffect(() => {
    getStorageItemPropertyPattern();
  }, [route.params.pattern]);

  const groupPropertiesByName = (properties: ItemProperty[]): ItemPropertiesGrouped => {
    return properties.reduce((groups, prop) => {
      const name = prop.propertyName;
      if (!groups[name]) {
        groups[name] = [];
      }
      groups[name].push({
        ...prop,
        originalPropertyValue: prop.propertyValue,
        isEdited: false,
        isDeleted: false,
      });
      return groups;
    }, {} as ItemPropertiesGrouped);
  };

  const handleSelectChange = (propertyName: string, updatedProperties: ItemProperty[]) => {
    setPropertyGroups((prevGroups) =>
      prevGroups.map(([key, value]) =>
        key === propertyName ? [key, updatedProperties] : [key, value]
      )
    );
  };

  const movePropertyGroup = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= propertyGroups.length) return;

    // Create a copy of the array with the correct type
    const newPropertyGroups: [string, ItemProperty[]][] = [...propertyGroups];

    // Swap positions
    [newPropertyGroups[index], newPropertyGroups[newIndex]] = [
      newPropertyGroups[newIndex],
      newPropertyGroups[index],
    ];

    const updatedGroups: [string, ItemProperty[]][] = newPropertyGroups.map(
      ([key, properties], groupIndex): [string, ItemProperty[]] => [
        key,
        properties.map((prop) => ({
          ...prop,
          orderGroup: groupIndex,
        })),
      ]
    );

    setPropertyGroups(updatedGroups);
  };

  const startEditing = (propertyName: string) => {
    setEditingPropertyName(propertyName);
    setEditedName(propertyName);
  };

  const handlePropertyNameEdit = () => {
    if (!editingPropertyName) return;

    setPropertyGroups((prevGroups) => {
      // Add explicit type annotation for updatedGroups
      const updatedGroups: [string, ItemProperty[]][] = prevGroups.map(
        ([key, value]): [string, ItemProperty[]] =>
          key === editingPropertyName
            ? [
                editedName,
                value.map((prop) => ({
                  ...prop,
                  propertyName: editedName,
                })),
              ]
            : [key, value]
      );

      const propertyNames = updatedGroups.map(([key]) => key);
      const duplicateNames = propertyNames.filter(
        (name, index) => propertyNames.indexOf(name) < index
      );

      if (duplicateNames.length) {
        AlertWithOptions(
          strings.DUPLICATE_NAME_TITLE,
          strings.DUPLICATE_NAME_MESSAGE,
          ...[, , ,],
          ''
        );
        return prevGroups;
      }

      return updatedGroups;
    });

    setEditingPropertyName(null);
  };

  const handlePropertyTypeChange = (newType: string) => {
    if (!editingPropertyType) return;

    setPropertyGroups((prevGroups) =>
      prevGroups.map(([key, value]) => {
        if (key === editingPropertyType) {
          if (newType === 'singleselect') {
            const selectedItems = value.filter((prop) => prop.selected);
            const updatedProperties = value.map((prop, index) => ({
              ...prop,
              propertyType: newType as 'singleselect' | 'multiselect',
              selected: selectedItems.length > 0 ? prop.id === selectedItems[0].id : false,
            }));
            return [key, updatedProperties];
          } else {
            return [
              key,
              value.map((prop) => ({
                ...prop,
                propertyType: newType as 'singleselect' | 'multiselect',
              })),
            ];
          }
        }
        return [key, value];
      })
    );
    setEditingPropertyType(null);
    propertyTypeBottomSheetRef.current?.closeModal();
  };

  const generateRandomId = (): number => {
    // Take the last 5 digits of current timestamp
    const timestamp = Date.now() % 100000;
    // Generate a random number between 0 and 9999
    const randomPart = Math.floor(Math.random() * 10000);
    // Combine them into a negative number to avoid conflicts with server IDs
    return -(timestamp * 10000 + randomPart);
  };

  const handleAddPropertyGroup = () => {
    let newGroupName = strings.DEFAULT_PROPERTY_NAME;
    let counter = 1;

    while (propertyGroups.some(([key]) => key === newGroupName)) {
      counter++;
      newGroupName = `${strings.DEFAULT_PROPERTY_NAME} ${counter}`;
    }

    const newId = generateRandomId();
    const newProperty: ItemProperty = {
      id: newId,
      propertyName: newGroupName,
      propertyValue: strings.DEFAULT_PROPERTY_VALUE,
      propertyType: 'singleselect',
      selected: false,
      required: false,
      dependsOn: null,
      orderGroup: propertyGroups.length,
      orderItem: 0,
      originalPropertyValue: strings.DEFAULT_PROPERTY_VALUE,
      isEdited: false,
    };

    setPropertyGroups((prevGroups) => [...prevGroups, [newGroupName, [newProperty]]]);

    // Schedule scroll and animation for next frame
    requestAnimationFrame(() => {
      scrollToBottom();
    });
  };

  const handleDeletePropertyGroup = (propertyName: string) => {
    setPropertyGroups((prevGroups) =>
      prevGroups.map(([key, value]) =>
        key === propertyName
          ? [
              key,
              value.map((prop) => ({
                ...prop,
                isDeletedGroup: !prop.isDeletedGroup,
              })),
            ]
          : [key, value]
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Transform groups back to flat array for saving
      const properties = propertyGroups
        .flatMap(([_, properties], groupIndex) =>
          properties.map((prop, itemIndex) => ({
            id: prop.id,
            isDeleted: prop.isDeleted || prop.isDeletedGroup,
            propertyName: prop.propertyName,
            propertyValue: prop.propertyValue,
            propertyType: prop.propertyType,
            orderGroup: groupIndex,
            orderItem: itemIndex,
            selected: prop.selected,
            required: prop.required,
            dependsOn: prop.dependsOn,
          }))
        )
        .filter((e) => !e.isDeleted)
        .map((e) => {
          delete e.isDeleted;
          return e;
        });

      const patternToSave = {
        id: route.params?.pattern?.id,
        itemProperties: properties,
      };

      const response: PropertyPattern[] = await patchRequest('/itemPropertyPatterns/save', [
        patternToSave,
      ]);
      if (!response) {
        return;
      }

      // Update local storage
      await setItemPropertyPatterns(response);

      //Re-load item
      getStorageItemPropertyPattern();
      // // Process the response data

      toast('success', strings.SUCCESS, strings.CHANGES_SAVED);
    } catch (error) {
      console.error('Save error:', error);
      toast('error', strings.ERROR, strings.SAVE_ERROR);
    } finally {
      setIsSaving(false);
    }
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
            <View style={[styles.itemContainer, { justifyContent: 'space-between' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => startEditing(propertyName)}
                  style={styles.editButton}
                  disabled={isDeleted}
                >
                  <EditIcon size={20} color="#fff"></EditIcon>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDeletePropertyGroup(propertyName)}
                  style={[styles.deleteButton, { marginLeft: 0 }]}
                >
                  {isDeleted ? (
                    <RestoreIcon size={20} color={colors.green}></RestoreIcon>
                  ) : (
                    <TrashIcon size={20} color={colors.lightRed}></TrashIcon>
                  )}
                </TouchableOpacity>

                <Text style={[styles.header, isDeleted && styles.deletedText]}>{propertyName}</Text>
              </View>
            </View>
          )}

          <View style={styles.reorderButtons}>
            <TouchableOpacity
              onPress={() => {
                setEditingPropertyType(propertyName);
                propertyTypeBottomSheetRef.current?.openModal();
              }}
              style={styles.propertyTypeButton}
              disabled={isDeleted}
            >
              {properties?.[0]?.propertyType === 'singleselect' ? (
                <RadioButtonChecked />
              ) : (
                <CheckBoxChecked />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => movePropertyGroup(index, 'up')}
              disabled={index === 0 || isDeleted}
              style={[styles.reorderButton, (index === 0 || isDeleted) && styles.disabledButton]}
            >
              <ChevronUpIcon size={20}></ChevronUpIcon>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => movePropertyGroup(index, 'down')}
              disabled={index === propertyGroups.length - 1 || isDeleted}
              style={[
                styles.reorderButton,
                (index === propertyGroups.length - 1 || isDeleted) && styles.disabledButton,
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
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <>
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={propertyGroups}
            renderItem={renderPropertyGroup}
            keyExtractor={(item, index) => `group-${item[0]}-${index}`}
            contentContainerStyle={{ paddingBottom: 50 }}
            onScrollToIndexFailed={(info) => {
              // Handle scroll failure by trying again after a delay
              setTimeout(() => {
                if (flatListRef.current && propertyGroups.length > 0) {
                  flatListRef.current.scrollToIndex({
                    index: propertyGroups.length - 1,
                    animated: true,
                  });
                }
              }, 100);
            }}
          />
          <FAB
            icon="plus"
            style={styles.fab}
            onPress={handleAddPropertyGroup}
            color={colors.white}
            animated={false}
          />
        </View>

        <View style={styles.addItemContainer}>
          <TouchableOpacity style={styles.addItemBtn} onPress={handleSave}>
            <Text style={styles.addItemBtnText}>{strings.SAVE_ALL}</Text>
          </TouchableOpacity>
          <PropertyTypeBottomSheet
            ref={propertyTypeBottomSheetRef}
            currentType={editingPropertyType}
            onTypeChange={handlePropertyTypeChange}
          />
        </View>

        {isSaving && <LoadingOverlay />}
      </>
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
});

export default AdminItemDetailsPatternEditScreen;
