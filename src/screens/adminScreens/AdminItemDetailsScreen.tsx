import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  TextInput,
} from 'react-native';
import { colors } from '../../core/theme';
import { navigateBack } from '../../navigation/AppNavigator';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const AdminItemDetailsScreen = ({ route }: any) => {
  const [item, setItem] = useState<ItemReq>();

  useEffect(() => {
    const deepCopy = JSON.parse(JSON.stringify(route.params.item));
    // Convert itemPropertiesGrouped from object to array of [key, value] pairs
    deepCopy.itemPropertiesGrouped = Object.entries(deepCopy.itemPropertiesGrouped).map(
      ([key, value]: any) => {
        // Add originalPropertyValue to each property
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

  // useEffect(() => {
  //   console.log(item?.itemPropertiesGrouped[0]);
  // }, [item]);

  const handleSelectChange = (propertyName: string, updatedProperties: ItemProperty[]) => {
    if (!item) return;
    setItem((prevItem: any) => ({
      ...prevItem,
      itemPropertiesGrouped: prevItem.itemPropertiesGrouped.map(([key, value]: [string, any[]]) =>
        key === propertyName ? [key, updatedProperties] : [key, value]
      ),
    }));
  };

  const renderPropertyGroup = ({
    item: [propertyName, properties],
    drag,
    isActive,
  }: RenderItemParams<[string, ItemProperty[]]>) => (
    <View
      style={[styles.propertyGroup, { backgroundColor: isActive ? colors.darkGrey : colors.grey }]}
    >
      <View style={styles.propertyGroupHeader}>
        <Pressable onPressIn={drag} disabled={isActive} style={styles.dragHandle}>
          <FontAwesome6 name="bars" size={20} color="#fff" />
        </Pressable>
        <Text style={styles.header}>{propertyName}</Text>
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
            <DraggableFlatList
              data={item.itemPropertiesGrouped as any}
              renderItem={renderPropertyGroup}
              keyExtractor={([key]) => key}
              onDragEnd={({ data }) => {
                setItem((prevItem: any) => ({
                  ...prevItem,
                  itemPropertiesGrouped: data,
                }));
              }}
            />
          </View>
          <View style={styles.addItemContainer}>
            <TouchableOpacity
              style={styles.addItemBtn}
              onPress={async () => {
                // Convert itemPropertiesGrouped back to an object before saving
                const itemToSave = {
                  ...item,
                  itemPropertiesGrouped: Object.fromEntries(item.itemPropertiesGrouped as any),
                };
                // if (isUpdate) {
                //   await updateItemOfTempItem(itemToSave, itemToSave.newItemId!);
                // } else {
                //   await addNewItemToTemp(itemToSave);
                // }
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

  const renderItem = ({ item, drag, isActive }: RenderItemParams<ItemProperty>) => (
    <TouchableOpacity
      style={[styles.itemContainer, { backgroundColor: isActive ? colors.darkGrey : colors.grey }]}
      onLongPress={drag}
      activeOpacity={0.8}
    >
      <Pressable onPressIn={drag} disabled={isActive} style={styles.dragHandle}>
        <MaterialIcons name="drag-handle" size={20} color="#fff" />
      </Pressable>

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
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <DraggableFlatList
        data={itemPropertiesGrouped}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString() + item.propertyValue}
        onDragEnd={({ data }) => onSelectChange(data)}
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
    marginLeft: 16,
  },
  dragHandle: {
    padding: 8,
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
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    // padding: 8,
  },
  itemText: {
    color: '#ffffff',
    marginLeft: 1,
  },
  commentButton: {
    width: '100%',
    minHeight: 50,
    backgroundColor: colors.veryLighterGrey,
    justifyContent: 'center',
  },
  commentText: {
    color: colors.black,
    marginLeft: 20,
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
    // padding: 8,
    margin: 0,
    padding: 0,
  },
  editInput: {
    flex: 1,
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
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
});

export default AdminItemDetailsScreen;
