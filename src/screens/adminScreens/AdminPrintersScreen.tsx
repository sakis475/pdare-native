import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AlertWithOptions, toast } from '../../core/utils';
import { colors } from '../../core/theme';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { TextInput, Button, Switch, SegmentedButtons, Portal, Dialog } from 'react-native-paper';
import { ActivityIndicator, FAB } from 'react-native-paper';
import { LoadingOverlay } from '../../components/basic/SavingOverlay';
import { getRequest, patchRequest, postRequest } from '../../helpers/requests';
import { useStrings } from '../../core/localization/languageContext';
import { EventEmitter, PRINTERS_DISCOVERED_UPDATE } from '../../helpers/Sockets/EventEmitter';
import dayjs from '../../core/dayjs';
import { CharacterSet } from '../../types/exportable.types';

enum PrintLocation {
  KITCHEN = 'kitchen',
  BAR = 'bar',
  ALL = 'all',
}

interface EditModalProps {
  visible: boolean;
  printer?: Printer | null;
  onDismiss: () => void;
  onSave: (updatedPrinter: Printer) => void;
  onDelete?: (id: number) => void;
  mode: 'edit' | 'create';
}

const EditModal: React.FC<EditModalProps> = ({ visible, printer, onDismiss, onSave, mode }) => {
  const [nickname, setNickname] = useState('');
  const [overrideIP, setOverrideIP] = useState('');
  const [overridePort, setOverridePort] = useState('');
  const [characterSet, setCharacterSet] = useState<CharacterSet | null>(null);
  const [printLocation, setPrintLocation] = useState<PrintLocation>(PrintLocation.ALL);
  const [active, setActive] = useState<boolean>(!!printer?.active);
  const [charSetPickerVisible, setCharSetPickerVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const handleSave = () => {
    if (!nickname.trim()) {
      AlertWithOptions('', 'Printer nickname cannot be empty');
      return;
    }

    // Add validation for required IP and port when creating a custom printer
    if (mode === 'create') {
      if (!overrideIP.trim()) {
        AlertWithOptions('', 'IP address is required for custom printers');
        return;
      }
    }

    onSave({
      ...printer,
      printerNickname: nickname.trim(),
      overrideIP: overrideIP.trim(),
      overridePort: overridePort.trim(),
      characterSet: characterSet?.trim(),
      active: active,
      printLocation,
    });
    onDismiss();
  };

  useEffect(() => {
    if (visible) {
      // If we have a printer, use its values, otherwise use defaults
      setNickname(printer?.printerNickname ?? '');
      setOverrideIP(printer?.overrideIP ?? '');
      setOverridePort(printer?.overridePort ?? '');
      setCharacterSet((printer?.characterSet as CharacterSet) ?? ('' as any));
      setPrintLocation(printer?.printLocation ?? PrintLocation.ALL);
      setActive(printer?.active);
    }
  }, [printer, visible]);

  // Update editModalVisible when parent visible prop changes
  useEffect(() => {
    setEditModalVisible(visible);
  }, [visible]);

  const handleCharSetPress = () => {
    setEditModalVisible(false); // Hide edit modal
    setCharSetPickerVisible(true);
  };

  const handleCharSetSelect = (value: CharacterSet) => {
    setCharacterSet(value);
    setCharSetPickerVisible(false);
    setEditModalVisible(true); // Show edit modal again
  };

  const handleCharSetDismiss = () => {
    setCharSetPickerVisible(false);
    setEditModalVisible(true); // Show edit modal again
  };

  // CharSet Picker Modal Component
  const CharSetPicker = () => (
    <Portal>
      <Dialog visible={charSetPickerVisible} onDismiss={handleCharSetDismiss}>
        <Dialog.Title>Select Character Set</Dialog.Title>
        <Dialog.Content>
          <FlatList
            data={Object.entries(CharacterSet)}
            keyExtractor={([key]) => key}
            style={styles.pickerList}
            renderItem={({ item: [key, value] }) => (
              <TouchableOpacity
                style={[styles.pickerItem, characterSet === value && styles.pickerItemSelected]}
                onPress={() => handleCharSetSelect(value)}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    characterSet === value && styles.pickerItemTextSelected,
                  ]}
                >
                  {key.replace(/_/g, ' ')}
                </Text>
              </TouchableOpacity>
            )}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleCharSetDismiss}>Cancel</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const handlePrintLocationChange = (value: string) => {
    setPrintLocation(value as PrintLocation);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Modal visible={editModalVisible} transparent animationType="fade" onRequestClose={onDismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {mode === 'edit' ? 'Edit Printer' : 'New Printer'}
              </Text>

              <ScrollView style={styles.scrollContent}>
                <TextInput
                  label="Nickname"
                  value={nickname}
                  onChangeText={setNickname}
                  style={styles.input}
                  mode="outlined"
                />

                <TextInput
                  label={`${mode === 'edit' ? 'Override IP (optional)' : 'IP'}`}
                  value={overrideIP}
                  onChangeText={setOverrideIP}
                  style={styles.input}
                  mode="outlined"
                />

                <TextInput
                  label={`${mode === 'edit' ? 'Override Port (optional)' : 'Port'}`}
                  value={overridePort}
                  onChangeText={setOverridePort}
                  style={styles.input}
                  mode="outlined"
                />

                <Text style={styles.inputLabel}>Print Items</Text>
                <SegmentedButtons
                  value={printLocation}
                  onValueChange={handlePrintLocationChange}
                  buttons={[
                    { value: PrintLocation.ALL, label: 'All' },
                    { value: PrintLocation.KITCHEN, label: 'Kitchen' },
                    { value: PrintLocation.BAR, label: 'Bar' },
                  ]}
                  style={styles.segmentedButtons}
                />

                <Text style={styles.inputLabel}>Character Set</Text>
                <TouchableOpacity style={styles.charsetButton} onPress={handleCharSetPress}>
                  <Text style={styles.charsetButtonText}>
                    {characterSet ? characterSet.replace(/_/g, ' ') : 'Select Character Set'}
                  </Text>
                </TouchableOpacity>

                {mode === 'edit' ? (
                  <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Active</Text>
                    <Switch value={active} onValueChange={setActive} />
                  </View>
                ) : null}

                <Text style={styles.switchContainer}>
                  {`${
                    printer?.printerIp
                      ? `Current IP: ${printer?.printerIp}${`${
                          printer?.printerPort ? `:${printer?.printerPort}` : ''
                        }`}`
                      : ''
                  }`}
                </Text>

                {/* Add padding at the bottom to ensure scrolling reveals all content */}
                <View style={{ height: 20 }} />
              </ScrollView>

              <View style={styles.buttonFooter}>
                <Button mode="outlined" onPress={onDismiss} style={styles.cancelButton}>
                  Cancel
                </Button>
                <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
                  Save
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      <CharSetPicker />
    </KeyboardAvoidingView>
  );
};

const PrinterItem = ({ printer, onEdit }: { printer: Printer; onEdit: any }) => (
  <TouchableOpacity
    style={[styles.printerItem, !printer.active && styles.disabledPrinter]}
    onPress={() => onEdit(printer)}
  >
    <View style={styles.printerInfo}>
      <Text style={[styles.printerName, !printer.active && styles.disabledPrinterText]}>
        {printer.printerNickname}
      </Text>
      <Text style={styles.printerDetails}>Print Items: {printer.printLocation}</Text>
      <Text style={styles.printerDetails}>
        Latest Discovery:{' '}
        {printer.lastDiscovered ? dayjs(printer.lastDiscovered).format('HH:mm DD/MM/YY') : '-'}
      </Text>
    </View>
    <FontAwesome6 name="pencil" size={16} color={colors.white} />
  </TouchableOpacity>
);

const AdminPrintersScreen = () => {
  const [printers, setPrinters] = useState<Printer[]>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const [mode, setMode] = useState<'edit' | 'create'>('edit');

  const strings = useStrings();

  const handleAddCustomPrinter = () => {
    setSelectedPrinter(null);
    setMode('create');
    setModalVisible(true);
  };

  const handleEditPress = (printer: Printer) => {
    setSelectedPrinter(printer);
    setMode('edit');
    setModalVisible(true);
  };

  const handleCreatePrinter = async (newPrinter: Printer) => {
    setIsLoading(true);

    const newPrinterToSend: Printer = {
      printerNickname: newPrinter.printerNickname,
      printerMac: '',
      printerIp: newPrinter.overrideIP,
      printerPort: newPrinter.overridePort,
      printLocation: newPrinter.printLocation,
      characterSet: newPrinter.characterSet,
    };

    console.log(newPrinterToSend, 'newPrinterToSend');

    try {
      const response = await postRequest('/printers', {
        printer: newPrinterToSend,
      });
      if (Array.isArray(response)) {
        setPrinters(response);
        toast('success', strings.SUCCESS, 'Printer added successfully');
      } else {
        throw new Error('No valid printer entity Response');
      }
    } catch (error) {
      toast('error', strings.ERROR, 'Failed to add printer');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrinters = async () => {
    try {
      const response = await getRequest('/printers');
      setPrinters(response);
    } catch (error) {
      toast('error', strings.ERROR, 'Failed to fetch printers');
    }
  };

  const handlePrinterDiscovered = useCallback((freshPrinters: Printer[]) => {
    // Early return if freshPrinters is null/undefined
    if (!freshPrinters) {
      toast('error', strings.NO_PRINTERS);
      setIsScanning(false);
      setPrinters([]);
      return;
    }

    setPrinters((currentPrinters) => {
      // Find new printers using current state
      const printersDiff = freshPrinters.filter(
        (freshPrinter) =>
          !currentPrinters?.some((printer) => freshPrinter.printerMac === printer.printerMac)
      );

      if (freshPrinters.length === 0) {
        // No printers found at all
        toast('error', strings.NO_PRINTERS);
      } else if (printersDiff.length > 0) {
        // Found new printers
        toast(
          'success',
          `Found ${printersDiff.length} new printer${printersDiff.length > 1 ? 's' : ''}!`
        );
      } else {
        // Found printers, but all were already known
        toast('info', 'All discovered printers are already registered');
      }

      return freshPrinters;
    });

    setIsScanning(false);
  }, []);

  useEffect(() => {
    fetchPrinters();
    const subscription = EventEmitter.addListener(
      PRINTERS_DISCOVERED_UPDATE,
      (freshPrinters: Printer[]) => {
        handlePrinterDiscovered(freshPrinters);
      }
    );
    return () => subscription.remove();
  }, []);

  const handleScanPrinters = async () => {
    setIsScanning(true);

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Scan timeout')), 10000);
    });

    try {
      // Wait for either the scan to complete or timeout
      await Promise.race([
        (async () => {
          await postRequest('/printers/requestScan');
          await fetchPrinters();

          // Set a flag to wait a bit for potential printer discovery
          await new Promise<void>((resolve) => {
            const discoveryTimeout = setTimeout(() => {
              setIsScanning(false);
              toast('error', strings.NO_PRINTERS);
              resolve();
            }, 2000); // Give 2 seconds for printer discovery

            // If printers are discovered, this listener will handle it
            const discoverySubscription = EventEmitter.addListener(
              PRINTERS_DISCOVERED_UPDATE,
              () => {
                clearTimeout(discoveryTimeout);
                resolve();
              }
            );

            // Cleanup
            setTimeout(() => {
              discoverySubscription.remove();
            }, 2000);
          });
        })(),
        timeoutPromise,
      ]);
    } catch (error) {
      toast('error', strings.ERROR, 'Scan timeout');
      setIsScanning(false);
    }
  };

  const handleEditPrinter = async (updatedPrinter: Printer) => {
    setIsLoading(true);

    console.log(updatedPrinter, 'updatedPrinter');
    try {
      const response = await patchRequest(`/printers`, {
        printer: updatedPrinter,
      });

      if (Array.isArray(response)) {
        setPrinters(response);
        toast('success', strings.SUCCESS, 'Printer added successfully');
      } else {
        throw new Error('No valid printer entity Response');
      }
    } catch (error) {
      toast('error', strings.ERROR, 'Failed to update printer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePrinter = async (printerId: number) => {
    setIsLoading(true);
    try {
      await patchRequest(`/printers/${printerId}`, {
        printer: { active: false },
      });
      setPrinters((prev) => prev.filter((printer) => printer.id !== printerId));
      toast('success', strings.SUCCESS, 'Printer deleted successfully');
    } catch (error) {
      toast('error', strings.ERROR, 'Failed to delete printer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        {printers === null ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : printers?.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No printers found</Text>
            <Text style={styles.emptyText}>Tap the search button to scan for printers</Text>
          </View>
        ) : (
          <FlatList
            data={printers}
            keyExtractor={(item) => `printer-${item.id}`}
            renderItem={({ item }) => <PrinterItem printer={item} onEdit={handleEditPress} />}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      <View style={styles.fabContainer}>
        <FAB
          icon="plus"
          style={[styles.fab, styles.addFab]}
          onPress={handleAddCustomPrinter}
          color={colors.darkGrey}
        />
        <FAB
          icon="magnify"
          style={[styles.fab, styles.scanFab]}
          onPress={handleScanPrinters}
          loading={isScanning}
          disabled={isScanning}
          color={colors.darkGrey}
        />
      </View>

      <EditModal
        visible={modalVisible}
        printer={selectedPrinter}
        onDismiss={() => {
          setModalVisible(false);
          setSelectedPrinter(null);
        }}
        onSave={mode === 'create' ? handleCreatePrinter : handleEditPrinter}
        onDelete={handleDeletePrinter}
        mode={mode}
      />

      {isLoading && <LoadingOverlay />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2F2F2F',
  },
  listContent: {
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'stretch',
    padding: 16,
  },
  modalContainer: {
    marginVertical: 40,
    maxHeight: '90%',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    flexDirection: 'column',
    height: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.grey,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  buttonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.lightGrey,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 2,
    marginLeft: 8,
  },
  modalScroll: {
    backgroundColor: 'white',
    borderRadius: 10,
    maxHeight: '100%',
  },
  printerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.darkGrey,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.white,
  },
  printerInfo: {
    flex: 1,
  },
  printerName: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  printerDetails: {
    color: colors.veryLighterGrey,
    fontSize: 14,
  },
  printerMac: {
    color: colors.veryLighterGrey,
    fontSize: 12,
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
  scanFab: {
    position: 'absolute',
    margin: 8,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  addFab: {
    position: 'absolute',
    margin: 8,
    left: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  input: {
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },
  disabledPrinter: {
    borderColor: colors.grey,
    backgroundColor: colors.lightRed,
    opacity: 0.7,
  },
  disabledPrinterText: {
    textDecorationLine: 'line-through',
    color: colors.lightGrey,
  },
  inputLabel: {
    color: colors.grey,
    marginBottom: 8,
    marginTop: 8,
  },
  segmentedButtons: {
    marginBottom: 20,
  },
  charsetButton: {
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: 4,
    padding: 12,
    marginBottom: 20,
  },
  charsetButtonText: {
    color: colors.grey,
  },
  pickerModal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    maxHeight: '80%',
  },
  pickerItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },
  pickerItemSelected: {
    backgroundColor: colors.primary + '20',
  },
  pickerItemText: {
    color: colors.grey,
  },
  pickerItemTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  switchLabel: {
    color: colors.grey,
  },
  pickerList: {
    maxHeight: 300,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fab: {
    backgroundColor: colors.primary,
  },
});

export default AdminPrintersScreen;
