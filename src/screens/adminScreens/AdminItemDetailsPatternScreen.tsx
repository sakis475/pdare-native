import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Button, Divider, FAB, Text, TextInput } from 'react-native-paper';
import { getStorage, setStorage } from '../../storage/store';
import { colors } from '../../core/theme';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { AlertWithOptions, toast } from '../../core/utils';
import { patchRequest } from '../../helpers/requests';
import { LoadingOverlay } from '../../components/basic/SavingOverlay';
import { useIsFocused } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { CategoryBottomSheet } from '../../components/bottomSheets/PatternCategorySelectBottomSheet';
import { Portal } from 'react-native-paper';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { navigate, ScreenNames } from '../../navigation/navigationUtils';

interface EditPatternModalProps {
  visible: boolean;
  pattern?: PropertyPattern | null;
  onDismiss: () => void;
  onSave: (updatedPattern: PropertyPattern) => void;
  onDelete?: (title: string) => void;
  mode: 'edit' | 'create';
  onCategoryPress: () => void;
  selectedCategory: Category | null;
  title: string; // Add these
  onTitleChange: (title: string) => void; // new props
}

const EditPatternModal: React.FC<EditPatternModalProps> = ({
  visible,
  pattern,
  onDismiss,
  onSave,
  onDelete,
  mode,
  onCategoryPress,
  selectedCategory,
  title,
  onTitleChange,
}) => {
  const handleSave = () => {
    if (!title.trim()) {
      AlertWithOptions(
        '',
        'Ο τίτλος του προτύπου είναι κενός',
        undefined,
        undefined,
        undefined,
        ''
      );
      return;
    }

    if (!selectedCategory) {
      AlertWithOptions('', 'Παρακαλώ επιλέξτε κατηγορία', undefined, undefined, undefined, '');
      return;
    }

    if (mode === 'create') {
      const newPattern: PropertyPattern = {
        propertyPatternTitle: title.trim(),
        itemProperties: [],
        category: selectedCategory,
      };
      onSave(newPattern);
    } else if (pattern) {
      onSave({
        ...pattern,
        propertyPatternTitle: title.trim(),
        category: selectedCategory,
      });
    }
    onDismiss();
  };

  const handleDelete = () => {
    if (!pattern || !onDelete) return;

    AlertWithOptions(
      'Επιβεβαίωση Διαγραφής',
      `Είστε σίγουροι ότι θέλετε να διαγράψετε το "${pattern.propertyPatternTitle}";`,
      () => {
        onDelete(pattern.propertyPatternTitle);
        onDismiss();
      },
      undefined,
      'Διαγραφή'
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* ... */}
          <TextInput
            label="Τίτλος Προτύπου"
            value={title}
            onChangeText={onTitleChange}
            style={styles.input}
            mode="outlined"
          />

          <TouchableOpacity style={styles.categorySelector} onPress={onCategoryPress}>
            <Text style={styles.categorySelectorLabel}>Κατηγορία</Text>
            <View style={styles.categorySelectorContent}>
              <Text style={styles.selectedCategory}>
                {selectedCategory?.title || 'Επιλέξτε Κατηγορία'}
              </Text>
              <MaterialIcons name="keyboard-arrow-down" size={24} color={colors.grey} />
            </View>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            {mode === 'edit' && onDelete && (
              <Button
                mode="outlined"
                onPress={handleDelete}
                style={[styles.deleteButton]}
                textColor={colors.lightRed}
              >
                <FontAwesome6 name="trash" size={15} color={colors.lightRed} />
              </Button>
            )}

            <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
              {mode === 'create' ? 'Δημιουργία' : 'Αποθήκευση'}
            </Button>
          </View>

          <View style={styles.buttonContainer}>
            <Button mode="outlined" onPress={onDismiss} style={styles.cancelButton}>
              Ακύρωση
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AdminItemDetailsPatternScreen = () => {
  const [patterns, setPatterns] = useState<PropertyPattern[]>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<PropertyPattern | null>(null);
  const [modalMode, setModalMode] = useState<'edit' | 'create'>('edit');
  const [isLoading, setIsLoading] = useState(false);

  const isFocused = useIsFocused();

  const [isSelectingCategory, setIsSelectingCategory] = useState(false);
  const [tempSelectedCategory, setTempSelectedCategory] = useState<Category | null>(null);
  const categoryBottomSheetRef = useRef<{ openModal: () => void; closeModal: () => void }>(null);
  const [patternTitle, setPatternTitle] = useState('');

  const handleSheetClose = () => {
    setIsSelectingCategory(false); // Show modal again when sheet closes
  };

  const handleCategoryPress = () => {
    setIsSelectingCategory(true); // Hide modal
    categoryBottomSheetRef.current?.openModal();
  };

  const handleCategorySelect = (category: Category) => {
    setTempSelectedCategory(category);
    categoryBottomSheetRef.current?.closeModal();
    setTimeout(() => {
      setIsSelectingCategory(false); // Show modal again
    }, 100); // Small delay to ensure smooth transition
  };

  const fetchPatterns = async () => {
    try {
      const fetchedPatterns = (await getStorage('propertyPatterns')) || [];

      // Filter out patterns marked as deleted when displaying
      setPatterns(fetchedPatterns.filter((pattern) => !pattern.markAsDelete));
    } catch (error) {
      console.error('Error fetching patterns:', error);
      toast('error', 'Error', 'Failed to load property patterns');
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchPatterns();
    }
  }, [isFocused]);

  const handlePatternsUpdate = async (updatedPatterns: PropertyPattern[]) => {
    setIsLoading(true);
    try {
      for (const [index, updatedItem] of updatedPatterns.entries()) {
        updatedItem.propertyPatternOrder = index;
      }

      // Send to server
      const response = await patchRequest('/itemPropertyPatterns/save', updatedPatterns);
      if (!Array.isArray(response)) {
        return;
      }

      // Update local storage with all patterns (including marked as deleted)
      await setStorage('propertyPatterns', response);

      // Update state with only non-deleted patterns
      setPatterns(response.filter((pattern) => !pattern.markAsDelete));

      toast('success', 'Επιτυχία', 'Οι αλλαγές αποθηκεύτηκαν επιτυχώς');
    } catch (error) {
      console.error('Error updating patterns:', error);
      toast('error', 'Σφάλμα', 'Παρουσιάστηκε σφάλμα κατά την αποθήκευση');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPattern = async (updatedPattern: PropertyPattern) => {
    const newPatterns = patterns.map((pattern) =>
      pattern.id === updatedPattern.id ? updatedPattern : pattern
    );

    // Check for duplicate titles
    const activeTitles = newPatterns
      .filter((p) => !p.markAsDelete)
      .map((p) => p.propertyPatternTitle);
    if (new Set(activeTitles).size !== activeTitles.length) {
      toast('error', 'Σφάλμα', 'Υπάρχει ήδη πρότυπο με αυτό το όνομα');
      return;
    }
    await handlePatternsUpdate(newPatterns);
  };

  const handleCreatePattern = async (newPattern: PropertyPattern) => {
    // Check for duplicate titles only among non-deleted patterns
    if (
      patterns?.some(
        (p) => !p.markAsDelete && p.propertyPatternTitle === newPattern.propertyPatternTitle
      )
    ) {
      toast('error', 'Σφάλμα', 'Υπάρχει ήδη πρότυπο με αυτό το όνομα');
      return;
    }

    for (const [index, updatedItem] of patterns.entries()) {
      updatedItem.propertyPatternOrder = index;
    }

    newPattern.propertyPatternOrder = patterns.length;

    const newPatterns = [...(patterns || []), newPattern];
    await handlePatternsUpdate(newPatterns);
  };

  const handleDelete = async (title: string) => {
    // Instead of filtering out, mark the pattern as deleted
    const newPatterns = patterns.map((pattern) =>
      pattern.propertyPatternTitle === title ? { ...pattern, markAsDelete: true } : pattern
    );
    await handlePatternsUpdate(newPatterns);
  };

  const handleEditPress = (pattern: PropertyPattern) => {
    setSelectedPattern(pattern);
    setTempSelectedCategory(pattern.category);
    setPatternTitle(pattern.propertyPatternTitle); // Set title when editing
    setModalMode('edit');
    setModalVisible(true);
  };

  const handleCreatePress = () => {
    setSelectedPattern(null);
    setTempSelectedCategory(null);
    setPatternTitle(''); // Reset title for new pattern
    setModalMode('create');
    setModalVisible(true);
  };

  const handleDragEnd = useCallback(
    async ({ data, from, to }: { data: PropertyPattern[]; from: number; to: number }) => {
      if (from !== to) {
        setPatterns(data);
        await handlePatternsUpdate(data);
      }
    },
    [handlePatternsUpdate]
  );

  const handlePatternPress = (pattern: PropertyPattern) => {
    navigate(ScreenNames.ManageItemDetailsPatternEditScreen, { pattern });
  };

  const renderItem = useCallback(
    ({ item: pattern, drag, isActive }: RenderItemParams<PropertyPattern>) => {
      return (
        <TouchableOpacity
          onPress={() => handlePatternPress(pattern)}
          style={[styles.item, { backgroundColor: isActive ? colors.darkGrey : colors.grey }]}
        >
          <Pressable onPressIn={drag} disabled={isActive} style={styles.dragHandle}>
            <FontAwesome6 name="bars" size={20} color="#fff" />
          </Pressable>
          <TouchableOpacity style={styles.editButton} onPress={() => handleEditPress(pattern)}>
            <FontAwesome6 name="pencil" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.itemContent}>
            <Text style={{ color: colors.white, fontSize: 16 }}>
              {pattern.propertyPatternTitle}
            </Text>
            <Text style={{ color: colors.white, fontSize: 12 }}>
              {new Set(pattern.itemProperties.map((prop) => prop.propertyName)).size} properties
            </Text>
          </View>
          <FontAwesome6 name="chevron-right" size={20} color="#fff" style={{ marginRight: 10 }} />
        </TouchableOpacity>
      );
    },
    [handleEditPress]
  );

  const handleModalDismiss = () => {
    setModalVisible(false);
    setSelectedPattern(null);
    setTempSelectedCategory(null);
    setPatternTitle(''); // Reset title on dismiss
    setIsSelectingCategory(false);
  };

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        {patterns?.length > 0 ? (
          <View style={styles.categoriesContainer}>
            <DraggableFlatList
              data={patterns}
              renderItem={renderItem}
              keyExtractor={(pattern) => pattern.propertyPatternTitle}
              onDragEnd={handleDragEnd}
              contentContainerStyle={styles.categoryFlashListContainer}
              ItemSeparatorComponent={Divider}
            />
          </View>
        ) : patterns === null ? (
          <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}>
            <Text style={{ textAlign: 'center', color: colors.white }}>
              Πρότυπα που προστίθενται θα εμφανίζονται εδώ.
            </Text>
          </View>
        )}

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleCreatePress}
          color={colors.darkGrey}
          animated={false}
        />

        <EditPatternModal
          visible={modalVisible && !isSelectingCategory}
          pattern={selectedPattern}
          onDismiss={handleModalDismiss}
          onSave={modalMode === 'create' ? handleCreatePattern : handleEditPattern}
          onDelete={modalMode === 'edit' ? handleDelete : undefined}
          mode={modalMode}
          onCategoryPress={handleCategoryPress}
          selectedCategory={tempSelectedCategory}
          title={patternTitle}
          onTitleChange={setPatternTitle}
        />

        <CategoryBottomSheet
          ref={categoryBottomSheetRef}
          currentCategory={tempSelectedCategory}
          onCategoryChange={handleCategorySelect}
          onClose={handleSheetClose}
        />

        {isLoading && <LoadingOverlay />}
      </View>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  // Styles remain unchanged
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#2F2F2F',
    justifyContent: 'center',
    alignContent: 'center',
  },
  categoriesContainer: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginVertical: 4,
    backgroundColor: colors.grey,
    borderRadius: 8,
  },
  dragHandle: {
    padding: 8,
    marginRight: 10,
    backgroundColor: colors.darkGrey,
    borderRadius: 4,
  },
  itemContent: {
    flex: 1,
  },
  categoryFlashListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: colors.grey,
  },
  input: {
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  deleteButton: {
    borderColor: colors.lightRed,
    minWidth: 48,
    padding: 0,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 3,
  },
  editButton: {
    padding: 8,
    marginRight: 4,
    backgroundColor: colors.darkGrey,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCategory: {
    fontSize: 16,
    color: colors.darkGrey,
  },
  categorySelector: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 4,
    padding: 12,
  },

  categorySelectorLabel: {
    fontSize: 12,
    color: colors.grey,
    marginBottom: 4,
  },

  categorySelectorContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default AdminItemDetailsPatternScreen;
