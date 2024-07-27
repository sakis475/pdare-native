import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Checkbox, Divider, RadioButton, TextInput } from 'react-native-paper';
import { colors } from '../../core/theme';
import { addNewItemToTemp, updateItemOfTempItem } from '../../helpers/orderStorage';
import { navigateBack } from '../../navigation/AppNavigator';
import CommentBottomSheet from '../../components/bottomSheets/CommentBottomSheet';

const UnifiedSelect = ({
  itemPropertiesGrouped,
  onSelectChange,
  isUpdate,
}: {
  itemPropertiesGrouped: ItemProperty[];
  onSelectChange: (updatedProperty: ItemProperty) => void;
  isUpdate: Boolean;
}) => {
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

  useEffect(() => {
    if (isUpdate) {
      const multiCheckedStates: any = {};
      for (const itemProperty of itemPropertiesGrouped) {
        if (itemProperty.propertyType === 'singleselect') {
          if (itemProperty.selected) {
            setSelectedId(itemProperty.id);
          }
        } else if (itemProperty.propertyType === 'multiselect') {
          if (itemProperty.selected) {
            multiCheckedStates[itemProperty.id] = true;
          }
        }
      }
      setCheckedStates(multiCheckedStates);
    }
  }, []);

  const handleRadioSelectChange = (property: ItemProperty) => {
    let isSelectedNow: boolean;
    if (property.id === selectedId) {
      isSelectedNow = false;
    } else {
      isSelectedNow = true;
    }

    if (selectedId === property.id) {
      setSelectedId(null);
    }

    onSelectChange({
      ...property,
      selected: isSelectedNow,
    });
  };

  const handleMultiSelectChange = (property: ItemProperty) => {
    setCheckedStates((prevStates) => ({
      ...prevStates,
      [property.id]: !prevStates[property.id],
    }));
    onSelectChange({
      ...property,
      selected: checkedStates[property.id],
    });
  };

  return (
    <View>
      {itemPropertiesGrouped.map((property) => (
        <TouchableOpacity
          key={property.id}
          style={styles.container}
          onPress={() => {
            setSelectedId(property.id);

            property.propertyType === 'singleselect'
              ? handleRadioSelectChange(property)
              : handleMultiSelectChange(property);
          }}
          activeOpacity={0.8}
        >
          {property.propertyType === 'singleselect' ? (
            <RadioButton.Android
              value={property.propertyValue}
              status={selectedId === property.id ? 'checked' : 'unchecked'}
              color={'#6495ED'}
              uncheckedColor={'#ffffff'}
              onPress={() => {
                setSelectedId(property.id);
                handleRadioSelectChange(property);
              }}
            />
          ) : (
            <Checkbox.Android
              status={checkedStates[property.id] ? 'checked' : 'unchecked'}
              color={'#6495ED'}
              uncheckedColor={'#ffffff'}
              onPress={() => handleMultiSelectChange(property)}
            />
          )}
          <Text style={{ color: '#ffffff' }}>{property.propertyValue}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const ItemDetailsScreen = ({ route }: any) => {
  const [item, setItem] = useState<ItemReq>();
  const isUpdate = Boolean(route.params.isUpdate);

  const [commentText, setCommentText] = useState(
    route.params.item?.comment ? route.params.item.comment : 'Γράψε σχόλιο για το προϊόν'
  );

  //START COMMENT MODAL LOGIC
  const commentBottomSheetRef = useRef<{ openModal: () => void; closeModal: () => void }>(null);

  const handleOpenModal = () => {
    commentBottomSheetRef.current?.openModal();
  };

  const handleCloseModal = () => {
    commentBottomSheetRef.current?.closeModal();
    Keyboard.dismiss();
  };

  //END COMMENT MODAL LOGIC

  useEffect(() => {
    //reset item everytime screen mounts
    const deepCopy = JSON.parse(JSON.stringify(route.params.item));

    setItem(deepCopy);
  }, [route.params.item]);

  const handleSelectChange = (updatedProperty: ItemProperty) => {
    if (!item) return;
    (item.itemPropertiesGrouped as ItemPropertiesGrouped)[updatedProperty.propertyName].forEach(
      (property: ItemProperty) => {
        if (property.propertyType === 'singleselect') {
          if (property.id === updatedProperty.id) {
            //if its already is true then make switch to false
            property.selected = property.selected ? !property.selected : true;
          } else {
            //in case this is not the updateProperty then should be false (singleselect: only one is selected or none)
            property.selected = false;
          }
        } else if (property.propertyType === 'multiselect') {
          //if its already true then make it false, if selected doesnt exist append selected and make it true
          if (property.id === updatedProperty.id) {
            property.selected = property.selected ? !property.selected : true;
          }
        }
      }
    );
    setItem((prevItem: any) => ({
      ...prevItem,
      itemPropertiesGrouped: item.itemPropertiesGrouped,
    }));
  };

  const handleCommentUpdate = (itemComment: string) => {
    setCommentText(itemComment ? itemComment : 'Γράψε σχόλιο για το προϊόν');

    setItem((prevItem: any) => ({
      ...prevItem,
      comment: itemComment,
    }));
  };

  return (
    <View style={styles.container}>
      {item ? (
        <View style={{ flex: 1, paddingTop: 16 }}>
          <ScrollView style={styles.scrollContainer} persistentScrollbar={true}>
            {Object.keys(item.itemPropertiesGrouped).map((propertyName, index, array) => (
              <View key={propertyName}>
                <Text style={styles.header}>{propertyName}</Text>
                <UnifiedSelect
                  itemPropertiesGrouped={
                    (item.itemPropertiesGrouped as ItemPropertiesGrouped)[propertyName]
                  }
                  onSelectChange={handleSelectChange}
                  isUpdate={isUpdate}
                ></UnifiedSelect>

                <Divider style={{ marginVertical: 8 }}></Divider>
              </View>
            ))}
            <Text style={styles.header}>Σχόλιο</Text>
            <TouchableOpacity
              onPress={handleOpenModal}
              style={{
                width: '100%',
                minHeight: 50,
                backgroundColor: colors.veryLighterGrey,
                justifyContent: 'center',
              }}
            >
              <Text style={styles.commentText}>{commentText}</Text>
            </TouchableOpacity>
          </ScrollView>
          <View style={styles.addItemContainer}>
            <TouchableOpacity
              style={styles.addItemBtn}
              onPress={async () => {
                if (isUpdate) {
                  await updateItemOfTempItem(item, item.newItemId!);
                  navigateBack();
                } else {
                  await addNewItemToTemp(item);
                  navigateBack();
                }
              }}
            >
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#ffffff' }}>
                {isUpdate ? 'Ενημέρωση' : 'Προσθήκη'}
              </Text>
            </TouchableOpacity>
          </View>
          <CommentBottomSheet
            ref={commentBottomSheetRef}
            item={item}
            itemCommentChange={handleCommentUpdate}
          ></CommentBottomSheet>
        </View>
      ) : (
        <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
      )}
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
    color: '#ffffff',
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
  commentText: {
    color: colors.black,
    marginLeft: 20,
  },
});

export default ItemDetailsScreen;
