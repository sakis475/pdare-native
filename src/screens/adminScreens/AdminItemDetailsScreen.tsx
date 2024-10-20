import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
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
    deepCopy.itemPropertiesGrouped = Object.entries(deepCopy.itemPropertiesGrouped);
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

const UnifiedSelect = ({
  itemPropertiesGrouped,
  onSelectChange,
}: {
  itemPropertiesGrouped: ItemProperty[];
  onSelectChange: (updatedProperties: ItemProperty[]) => void;
}) => {
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
        <Text style={styles.itemText}>{item.propertyValue}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <DraggableFlatList
      data={itemPropertiesGrouped}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString() + item.propertyValue}
      onDragEnd={({ data }) => onSelectChange(data)}
    />
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
    padding: 8,
  },
  itemText: {
    color: '#ffffff',
    marginLeft: 8,
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
});

export default AdminItemDetailsScreen;
