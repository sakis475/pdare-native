import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, FlatList, ScrollView } from 'react-native';
import { AlertWithOptions, toast } from '../../core/utils';
import { colors } from '../../core/theme';
import { TextInput, Button, Switch, SegmentedButtons, Portal, Dialog } from 'react-native-paper';
import { ActivityIndicator, FAB } from 'react-native-paper';
import { LoadingOverlay } from '../../components/basic/SavingOverlay';
import { getRequest, patchRequest, postRequest } from '../../helpers/requests';
import { useStrings } from '../../core/localization/languageContext';
import { EventEmitter, PRINTERS_DISCOVERED_UPDATE } from '../../helpers/Sockets/EventEmitter';
import dayjs from '../../core/dayjs';
import { CharacterSet } from '../../types/exportable.types';
import { EditIcon } from '../../components/basic/Icons';
import BaseModal from '../../components/basic/BaseModal';
import CustomSegmentedButtons from '../../components/basic/CustomSegmentedButtons';
import CustomTextInput from '../../components/basic/CustomTextInput';
import { Printer, User } from '../../types/basic.types';
import { getStorage } from '../../storage/store';
import {
  LINUX_PRINTER_APP_DOWNLOAD_URL,
  WINDOWS_PRINTER_APP_DOWNLOAD_URL,
} from '../../storage/env';
import CustomButton from '../../components/basic/CustomButton';
import PrinterGuide from '../../components/guides/guides/PrintersGuide';
import { useHelpModal } from '../../providers/HelpContext';
import { HelpModal } from '../../components/guides/HelpModal';

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
  const strings = useStrings();
  const [nickname, setNickname] = useState('');
  const [overrideIP, setOverrideIP] = useState('');
  const [overridePort, setOverridePort] = useState('');
  const [characterSet, setCharacterSet] = useState<CharacterSet | null>(null);
  const [printLocation, setPrintLocation] = useState<PrintLocation>(PrintLocation.ALL);
  const [active, setActive] = useState<boolean>(!!printer?.active);
  const [printAnalysis, setPrintAnalysis] = useState<boolean>(!!printer?.active);
  const [charSetPickerVisible, setCharSetPickerVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const handleSave = () => {
    if (!nickname.trim()) {
      AlertWithOptions('', strings.EMPTY_NICKNAME_ERROR);
      return;
    }

    // Add validation for required IP and port when creating a custom printer
    if (mode === 'create') {
      if (!overrideIP.trim()) {
        AlertWithOptions('', strings.IP_REQUIRED_ERROR);
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
      analysisPrinter: printAnalysis,
    });
    onDismiss();
  };

  useEffect(() => {
    if (visible) {
      setNickname(printer?.printerNickname ?? '');
      setOverrideIP(printer?.overrideIP ?? '');
      setOverridePort(printer?.overridePort ?? '');
      setCharacterSet((printer?.characterSet as CharacterSet) ?? ('' as any));
      setPrintLocation(printer?.printLocation ?? PrintLocation.ALL);
      setActive(printer?.active ?? true);
      setPrintAnalysis(printer?.analysisPrinter ?? true);
      setEditModalVisible(true);
      setCharSetPickerVisible(false);
    }
  }, [printer, visible]);

  const handleCharSetPress = () => {
    setEditModalVisible(false);
    setTimeout(() => {
      setCharSetPickerVisible(true);
    }, 300); // Add small delay to ensure smooth transition
  };

  const handleCharSetSelect = (value: CharacterSet) => {
    setCharacterSet(value);
    setCharSetPickerVisible(false);
    setTimeout(() => {
      setEditModalVisible(true);
    }, 300); // Add small delay to ensure smooth transition
  };

  const handleCharSetDismiss = () => {
    setCharSetPickerVisible(false);
    setTimeout(() => {
      setEditModalVisible(true);
    }, 300); // Add small delay to ensure smooth transition
  };

  // CharSet Picker Modal Component
  const CharSetPicker = () => (
    <Portal>
      <Dialog visible={charSetPickerVisible} onDismiss={handleCharSetDismiss}>
        <Dialog.Title>{strings.SELECT_CHARACTER_SET}</Dialog.Title>
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
          <Button onPress={handleCharSetDismiss}>{strings.CANCEL}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const handlePrintLocationChange = (value: string) => {
    setPrintLocation(value as PrintLocation);
  };

  return (
    <>
      <BaseModal
        title={mode === 'edit' ? strings.EDIT_PRINTER : strings.NEW_PRINTER}
        visible={editModalVisible && visible}
        onClose={() => {
          setEditModalVisible(false);
          onDismiss();
        }}
        onConfirm={handleSave}
        testID="item-list-edit-modal"
      >
        <CustomTextInput
          label={strings.NICKNAME}
          value={nickname}
          onChangeText={setNickname}
          style={styles.input}
          mode="outlined"
          theme="light"
        />

        <CustomTextInput
          label={mode === 'edit' ? strings.OVERRIDE_IP : strings.IP}
          value={overrideIP}
          onChangeText={setOverrideIP}
          style={styles.input}
          mode="outlined"
          theme="light"
        />

        <CustomTextInput
          label={mode === 'edit' ? strings.OVERRIDE_PORT : strings.PORT}
          value={overridePort}
          onChangeText={setOverridePort}
          style={styles.input}
          mode="outlined"
          theme="light"
        />

        <Text style={styles.inputLabel}>{strings.PRINT_LOCATION}</Text>
        <CustomSegmentedButtons
          value={printLocation}
          onValueChange={handlePrintLocationChange}
          buttons={[
            { value: PrintLocation.ALL, label: strings.ALL },
            { value: PrintLocation.KITCHEN, label: strings.KITCHEN },
            { value: PrintLocation.BAR, label: strings.BAR },
          ]}
          style={styles.segmentedButtons}
        />

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>{strings.ANALYSIS_PRINTER}</Text>
          <Switch value={printAnalysis} onValueChange={setPrintAnalysis} />
        </View>

        <Text style={styles.inputLabel}>{strings.CHARACTER_SET}</Text>
        <TouchableOpacity style={styles.charsetButton} onPress={handleCharSetPress}>
          <Text style={styles.charsetButtonText}>
            {characterSet ? characterSet.replace(/_/g, ' ') : strings.SELECT_CHARACTER_SET}
          </Text>
        </TouchableOpacity>

        {mode === 'edit' && (
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>{strings.ACTIVE}</Text>
            <Switch value={active} onValueChange={setActive} />
          </View>
        )}

        <Text style={styles.switchContainer}>
          {printer?.printerIp &&
            `${strings.CURRENT_IP}: ${printer.printerIp}${
              printer.printerPort ? `:${printer.printerPort}` : ''
            }`}
        </Text>
        <View style={{ height: 20 }} />
      </BaseModal>
      <CharSetPicker />
    </>
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
    <EditIcon size={16} color={colors.white} />
  </TouchableOpacity>
);

const AdminPrintersScreen = () => {
  const [printers, setPrinters] = useState<Printer[]>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(null);

  const [mode, setMode] = useState<'edit' | 'create'>('edit');

  const strings = useStrings();

  const { showHelpModal, helpContent, helpTitle, closeHelpModal } = useHelpModal();

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
      analysisPrinter: newPrinter.analysisPrinter,
    };

    try {
      const response = await postRequest('/printers', {
        printer: newPrinterToSend,
      });
      if (Array.isArray(response)) {
        setPrinters(response);
        toast('success', strings.SUCCESS, strings.PRINTER_ADDED);
      } else {
        throw new Error('No valid printer entity Response');
      }
    } catch (error) {
      toast('error', strings.ERROR, strings.PRINTER_ADD_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrinters = async () => {
    try {
      const response = await getRequest('/printers');
      const currentUser = await getStorage('currentUser');
      setPrinters(response);
      setCurrentUser(currentUser);
    } catch (error) {
      toast('error', strings.ERROR, strings.PRINTER_FETCH_FAILED);
    }
  };

  const handlePrinterDiscovered = useCallback((freshPrinters: Printer[]) => {
    console.log(freshPrinters, 'freshPrinters');
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
        toast('success', `${strings.FOUND} ${printersDiff.length} ${strings.NEW_PRINTER}!`);
      } else {
        // Found printers, but all were already known
        toast('info', strings.ALL_PRINTERS_REGISTERED);
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
            }, 20000); // Give 5 seconds for printer discovery

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
      toast('error', strings.ERROR, strings.SCAN_TIMEOUT);
      setIsScanning(false);
    }
  };

  const handleEditPrinter = async (updatedPrinter: Printer) => {
    setIsLoading(true);

    try {
      const response = await patchRequest(`/printers`, {
        printer: updatedPrinter,
      });

      if (Array.isArray(response)) {
        setPrinters(response);
        toast('success', strings.SUCCESS, strings.PRINTER_ADDED);
      } else {
        throw new Error('No valid printer entity Response');
      }
    } catch (error) {
      toast('error', strings.ERROR, strings.PRINTER_UPDATE_FAILED);
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
      toast('success', strings.SUCCESS, strings.PRINTER_DELETED);
    } catch (error) {
      toast('error', strings.ERROR, strings.PRINTER_DELETE_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {printers === null ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : !currentUser?.restaurant?.isPrinterAppInstalled ? (
        <View style={{ flex: 1, padding: 10 }}>
          <Text style={styles.noAppTitle}>{strings.NO_PRINTER_APP}</Text>
          <View style={{ flex: 1, maxHeight: '75%' }}>
            <PrinterGuide />
          </View>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={printers}
          keyExtractor={(item) => `printer-${item.id}`}
          renderItem={({ item }) => <PrinterItem printer={item} onEdit={handleEditPress} />}
          contentContainerStyle={[styles.listContent]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{strings.NO_PRINTERS}</Text>
              <Text style={styles.emptyText}>{strings.TAP_TO_SCAN}</Text>
            </View>
          }
        />
      )}

      <View style={styles.fabContainer}>
        <FAB
          icon="plus"
          style={[styles.fab, styles.addFab]}
          onPress={handleAddCustomPrinter}
          color={colors.white}
        />
        <FAB
          icon="magnify"
          style={[styles.fab, styles.scanFab]}
          onPress={handleScanPrinters}
          loading={isScanning}
          disabled={isScanning}
          color={colors.white}
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

      <HelpModal
        visible={showHelpModal}
        onClose={closeHelpModal}
        helpContent={helpContent}
        title={helpTitle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2F2F2F',
  },
  list: {
    flex: 1,
  },
  listContent: {
    flex: 1,
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
    maxHeight: '100%',
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
  noAppContainer: {
    flex: 1,
    padding: 20,
  },
  noAppTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'left',
  },
  noAppInstructionsContainer: {
    width: '100%',
    maxWidth: 500,
  },
  noAppText: {
    color: colors.white,
    marginBottom: 16,
    textAlign: 'left',
  },
  noAppStep: {
    color: colors.white,
    marginBottom: 12,
    textAlign: 'left',
  },
  noAppIndent: {
    color: colors.white,
    marginLeft: 20,
    marginBottom: 8,
    textAlign: 'left',
  },
});

export default AdminPrintersScreen;
