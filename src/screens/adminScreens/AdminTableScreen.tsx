import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  ScrollView,
  StyleProp,
  Modal,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { AlertWithOptions, naturalSort, toast } from '../../core/utils';
import { colors } from '../../core/theme';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { TextInput, Button } from 'react-native-paper';
import { ActivityIndicator, FAB } from 'react-native-paper';
import { LoadingOverlay } from '../../components/basic/SavingOverlay';
import { reqFetchTables } from '../../helpers/storage/tablesStorage';
import { patchRequest } from '../../helpers/requests';
import { getStorage, setStorage } from '../../storage/store';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const GRID_SIZE = 4;
const MARGIN = 4;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOX_SIZE = Math.floor((SCREEN_WIDTH - MARGIN * 2) / GRID_SIZE) - MARGIN;
const GRID_WIDTH = BOX_SIZE * GRID_SIZE + MARGIN * (GRID_SIZE - 1);
const DRAG_HANDLE_SIZE = 20;

interface BoxData extends Table {
  index: number;
  onEdit?: any;
}

interface EditModalProps {
  visible: boolean;
  table?: Table | null;
  onDismiss: () => void;
  onSave: (updatedTable: Table) => void;
  onDelete?: (id: number) => void;
  mode: 'edit' | 'create';
}

type BoxProps = {
  item: BoxData;
  tablesLength: number;
  onDragEnd: (fromIndex: number, toIndex: number | null) => void;
};

const EditModal: React.FC<EditModalProps> = ({
  visible,
  table,
  onDismiss,
  onSave,
  onDelete,
  mode,
}) => {
  const [tableName, setTableName] = useState(table?.tableName || '');

  useEffect(() => {
    setTableName(table?.tableName || '');
  }, [table]);

  const handleSave = () => {
    if (!tableName.trim()) {
      AlertWithOptions(
        '',
        'Το όνομα του τραπεζιού είναι κενό',
        undefined,
        undefined,
        undefined,
        ''
      );
      return;
    }

    if (mode === 'create') {
      const newTable: Table = {
        id: 0, // This will be set by the backend
        tableName: tableName.trim(),
        isEnabled: true,
        tableOrder: 1,
      };
      onSave(newTable);
    } else {
      onSave({
        ...table,
        tableName: tableName.trim(),
      });
    }
    onDismiss();
  };

  const handleDelete = () => {
    if (!table || !onDelete) return;

    AlertWithOptions(
      'Επιβεβαίωση Διαγραφής',
      `Είστε σίγουροι ότι θέλετε να διαγράψετε το τραπέζι "${table.tableName}";`,
      () => {
        onDelete(table.id);
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
          <Text style={styles.modalTitle}>
            {mode === 'create' ? 'Δημιουργία Τραπεζιού' : 'Ενημέρωση Τραπεζιού'}
          </Text>

          <TextInput
            label="Όνομα Τραπεζιού"
            value={tableName}
            onChangeText={setTableName}
            style={styles.input}
            mode="outlined"
          />

          <View style={styles.buttonUpdateContainer}>
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
          <View style={styles.buttonUpdateContainer}>
            <Button mode="outlined" onPress={onDismiss} style={styles.cancelButton}>
              Ακύρωση
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const TableBox: React.FC<Table & { onEdit?: () => void }> = (table) => {
  return (
    <View style={styles.buttonContainer}>
      <View style={[styles.tableBox]}>
        <TouchableOpacity style={styles.editButton} onPress={table.onEdit}>
          <FontAwesome6 name="pencil" size={16} color={colors.white} />
        </TouchableOpacity>
        <View style={{ backgroundColor: '#333', borderRadius: 4, paddingHorizontal: 3 }}>
          <Text style={styles.tableText}>{table.tableName}</Text>
        </View>
      </View>
    </View>
  );
};

const Box: React.FC<BoxProps> = ({ item, onDragEnd, tablesLength }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
  }, [tablesLength]);

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { startX: number; startY: number }
  >({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
      isDragging.value = true;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: () => {
      const totalItems = tablesLength;
      const itemRow = Math.floor(item.index / GRID_SIZE);
      const itemCol = item.index % GRID_SIZE;

      const currentCenterX = itemCol * (BOX_SIZE + MARGIN) + translateX.value + BOX_SIZE / 2;
      const currentCenterY = itemRow * (BOX_SIZE + MARGIN) + translateY.value + BOX_SIZE / 2;

      let closestIndex = item.index;
      let minDistance = Number.MAX_VALUE;

      for (let i = 0; i < totalItems; i++) {
        const targetRow = Math.floor(i / GRID_SIZE);
        const targetCol = i % GRID_SIZE;
        const targetCenterX = targetCol * (BOX_SIZE + MARGIN) + BOX_SIZE / 2;
        const targetCenterY = targetRow * (BOX_SIZE + MARGIN) + BOX_SIZE / 2;

        const distance = Math.sqrt(
          Math.pow(currentCenterX - targetCenterX, 2) + Math.pow(currentCenterY - targetCenterY, 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }

      if (closestIndex !== item.index) {
        runOnJS(onDragEnd)(item.index, closestIndex);
      } else {
        runOnJS(onDragEnd)(item.index, null);
      }

      translateX.value = 0;
      translateY.value = 0;
      isDragging.value = false;
    },
  });

  const animatedStyle = useAnimatedStyle<StyleProp<any>>(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    zIndex: isDragging.value ? 1 : 0,
  }));

  return (
    <Animated.View style={[styles.boxWrapper, animatedStyle]}>
      <TableBox {...item} />
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.dragHandle]}>
          <FontAwesome6 name="bars" size={DRAG_HANDLE_SIZE} color={colors.white} />
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
};

const AdminTableScreen = () => {
  const [tables, setTables] = useState<BoxData[]>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [modalMode, setModalMode] = useState<'edit' | 'create'>('edit');
  const [isLoading, setIsLoading] = useState(false);

  const fetchTables = async () => {
    const allTables = await getStorage('tables');
    if (!allTables) {
      return;
    }

    let index = 0;
    const tablesWithIndex = allTables.map((e) => Object.assign(e, { index: index++ }));
    setTables(tablesWithIndex);
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleTableUpdate = async (boxData: BoxData[]) => {
    setIsLoading(true);
    try {
      for (const [index, table] of boxData.entries()) {
        table.tableOrder = index;
      }
      // Replace with your update tables endpoint
      const allTablesResult: BoxData[] = await patchRequest('/tables/updateMany', boxData);
      for (const table of allTablesResult) {
        table.index = table.tableOrder;
      }

      await setStorage('tables', allTablesResult);

      setTables(allTablesResult);

      toast('success', 'Επιτυχία', 'Οι αλλαγές αποθηκεύτηκαν επιτυχώς', 1100);
    } catch (error) {
      toast('error', 'Σφάλμα', 'Παρουσιάστηκε σφάλμα κατά την αποθήκευση');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTable = async (updatedTable: Table) => {
    const newTables = tables.map((table) =>
      table.id === updatedTable.id ? { ...updatedTable, index: table.index } : table
    );
    await handleTableUpdate(newTables);
  };

  const handleCreateTable = async (newTable: Table) => {
    const newTables = [...(tables || []), { ...newTable, index: tables?.length || 0 }];
    await handleTableUpdate(newTables);
  };

  const handleDeleteTable = async (tableId: number) => {
    const newTables = tables.map((table) =>
      table.id === tableId ? { ...table, isEnabled: false } : table
    );
    await handleTableUpdate(newTables);
  };

  const handleEditPress = (table: Table) => {
    setSelectedTable(table);
    setModalMode('edit');
    setModalVisible(true);
  };

  const handleCreatePress = () => {
    setSelectedTable(null);
    setModalMode('create');
    setModalVisible(true);
  };

  const onDragEnd = useCallback(
    (fromIndex: number, toIndex: number | null) => {
      if (toIndex === null || toIndex === fromIndex) {
        return;
      }

      const copyTables = [...tables];
      copyTables[fromIndex] = tables[toIndex];
      copyTables[toIndex] = tables[fromIndex];

      handleTableUpdate(copyTables);
    },
    [tables, handleTableUpdate]
  );

  const handleSortNaturally = async () => {
    if (!tables?.length) return;

    AlertWithOptions(
      'Αυτόματη Ταξινόμηση Τραπεζιών',
      'Η ενέργεια αυτή θα αναδιατάξει τα τραπέζια με αλφαβητική σειρά. Θέλετε να συνεχίσετε;',
      async () => {
        setIsLoading(true);
        try {
          const sortedTables = [...tables].sort((a, b) => naturalSort(a.tableName, b.tableName));

          // Update indexes after sorting
          const tablesWithNewIndexes = sortedTables.map((table, index) => ({
            ...table,
            index,
          }));

          await handleTableUpdate(tablesWithNewIndexes);
          toast('success', 'Επιτυχία', 'Τα τραπέζια ταξινομήθηκαν επιτυχώς', 1100);
        } catch (error) {
          toast('error', 'Σφάλμα', 'Παρουσιάστηκε σφάλμα κατά την ταξινόμηση');
        } finally {
          setIsLoading(false);
        }
      },
      () => {}
    );
  };

  return (
    <>
      <View style={styles.mainContainer}>
        {tables?.length ? (
          <>
            <ScrollView
              style={styles.scrollViewContainer}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.container}>
                <View style={styles.grid}>
                  {tables
                    .filter((table) => table.isEnabled !== false)
                    .map((table) => (
                      <Box
                        key={`table-${table.id}`}
                        item={{
                          ...table,
                          onEdit: () => handleEditPress(table),
                        }}
                        onDragEnd={onDragEnd}
                        tablesLength={tables.length}
                      />
                    ))}
                </View>
              </View>
            </ScrollView>

            <FAB
              icon={() => <MaterialIcons name="sort-by-alpha" size={24} color={colors.darkGrey} />}
              style={styles.sortFab}
              onPress={handleSortNaturally}
              color={colors.darkGrey}
              animated={false}
            />

            <FAB
              icon="plus"
              style={styles.createFab}
              onPress={handleCreatePress}
              color={colors.darkGrey}
              animated={false}
            />
          </>
        ) : tables === null ? (
          <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
        ) : (
          <>
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Τραπέζια που προστίθενται</Text>
              <Text style={styles.emptyText}>θα εμφανίζονται εδώ</Text>
            </View>
            <FAB
              icon="plus"
              style={styles.createFab}
              onPress={handleCreatePress}
              color={colors.darkGrey}
              animated={false}
            />
          </>
        )}
      </View>

      <EditModal
        visible={modalVisible}
        table={selectedTable}
        onDismiss={() => {
          setModalVisible(false);
          setSelectedTable(null);
        }}
        onSave={modalMode === 'create' ? handleCreateTable : handleEditTable}
        onDelete={modalMode === 'edit' ? handleDeleteTable : undefined}
        mode={modalMode}
      />

      {isLoading && <LoadingOverlay />}
    </>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 100,
    backgroundColor: '#2F2F2F',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: MARGIN,
    paddingBottom: 80,
    backgroundColor: '#2F2F2F',
  },
  grid: {
    width: GRID_WIDTH,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: MARGIN, // This ensures even spacing between items
  },
  boxWrapper: {
    width: BOX_SIZE,
    height: BOX_SIZE,
  },
  buttonContainer: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  categoryBox: {
    width: BOX_SIZE - 10,
    height: BOX_SIZE - 10,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.black,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 10,
  },
  dragHandle: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: DRAG_HANDLE_SIZE,
    height: DRAG_HANDLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  editButton: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: DRAG_HANDLE_SIZE,
    height: DRAG_HANDLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
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
  colorPreview: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 20,
  },
  colorPickerContainer: {
    height: 300,
    marginBottom: 20,
  },
  colorPickerButton: {
    marginTop: 10,
  },
  buttonUpdateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  deleteButton: {
    borderColor: 'red',
    minWidth: 48,
    padding: 0,
  },
  cancelButton: {
    flex: 1,
    fontSize: 20,
  },
  saveButton: {
    flex: 3,
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F2F2F',
  },
  createFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  sortFab: {
    position: 'absolute',
    margin: 16,
    left: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  tableBox: {
    width: BOX_SIZE - 10,
    height: BOX_SIZE - 10,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.white,
    backgroundColor: colors.darkGrey,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 10,
  },
  tableText: {
    color: colors.white,
    fontWeight: 'bold',
    padding: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: colors.white,
    textAlign: 'center',
  },
});

export default AdminTableScreen;
