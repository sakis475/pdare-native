import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  TextInput,
  FlatList,
} from 'react-native';
import { colors } from '../../core/theme';
import { navigateBack } from '../../navigation/AppNavigator';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const AdminItemDetailsScreen = ({ route }: any) => {
  const [item, setItem] = useState<ItemReq>();

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

  const renderPropertyGroup = ({ item: [propertyName, properties], index }: any) => (
    <View style={styles.propertyGroup}>
      <View style={styles.propertyGroupHeader}>
        <Text style={styles.header}>{propertyName}</Text>
        <View style={styles.reorderButtons}>
          <TouchableOpacity
            onPress={() => movePropertyGroup(index, 'up')}
            disabled={index === 0}
            style={[styles.reorderButton, index === 0 && styles.disabledButton]}
          >
            <MaterialIcons name="arrow-upward" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => movePropertyGroup(index, 'down')}
            disabled={index === (item!.itemPropertiesGrouped as any).length - 1}
            style={[
              styles.reorderButton,
              index === (item!.itemPropertiesGrouped as any).length - 1 && styles.disabledButton,
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
                navigateBack();
              }}
            >
              <Text style={styles.addItemBtnText}>Αποθήκευση</Text>
            </TouchableOpacity>
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
      propertyName: itemPropertiesGrouped[0].propertyName,
      propertyValue: 'unnamed-property',
      propertyType: 'singleselect',
      isEnabled: true,
      orderGroup: null,
      orderItem: itemPropertiesGrouped.length,
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
    padding: 8,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.grey,
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
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
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
});

export default AdminItemDetailsScreen;
