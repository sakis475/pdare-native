import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  FlatList,
  ScrollView,
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

enum CharacterSet {
  PC437_USA = 'PC437_USA',
  PC850_MULTILINGUAL = 'PC850_MULTILINGUAL',
  PC860_PORTUGUESE = 'PC860_PORTUGUESE',
  PC863_CANADIAN_FRENCH = 'PC863_CANADIAN_FRENCH',
  PC865_NORDIC = 'PC865_NORDIC',
  PC851_GREEK = 'PC851_GREEK',
  PC857_TURKISH = 'PC857_TURKISH',
  PC737_GREEK = 'PC737_GREEK',
  ISO8859_7_GREEK = 'ISO8859_7_GREEK',
  WPC1252 = 'WPC1252',
  PC866_CYRILLIC2 = 'PC866_CYRILLIC2',
  PC852_LATIN2 = 'PC852_LATIN2',
  SLOVENIA = 'SLOVENIA',
  PC858_EURO = 'PC858_EURO',
  WPC775_BALTIC_RIM = 'WPC775_BALTIC_RIM',
  PC855_CYRILLIC = 'PC855_CYRILLIC',
  PC861_ICELANDIC = 'PC861_ICELANDIC',
  PC862_HEBREW = 'PC862_HEBREW',
  PC864_ARABIC = 'PC864_ARABIC',
  PC869_GREEK = 'PC869_GREEK',
  ISO8859_2_LATIN2 = 'ISO8859_2_LATIN2',
  ISO8859_15_LATIN9 = 'ISO8859_15_LATIN9',
  PC1125_UKRANIAN = 'PC1125_UKRANIAN',
  WPC1250_LATIN2 = 'WPC1250_LATIN2',
  WPC1251_CYRILLIC = 'WPC1251_CYRILLIC',
  WPC1253_GREEK = 'WPC1253_GREEK',
  WPC1254_TURKISH = 'WPC1254_TURKISH',
  WPC1255_HEBREW = 'WPC1255_HEBREW',
  WPC1256_ARABIC = 'WPC1256_ARABIC',
  WPC1257_BALTIC_RIM = 'WPC1257_BALTIC_RIM',
  WPC1258_VIETNAMESE = 'WPC1258_VIETNAMESE',
  KZ1048_KAZAKHSTAN = 'KZ1048_KAZAKHSTAN',
  JAPAN = 'JAPAN',
  KOREA = 'KOREA',
  CHINA = 'CHINA',
  HK_TW = 'HK_TW',
  TCVN_VIETNAMESE = 'TCVN_VIETNAMESE',
}

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

    onSave({
      ...printer,
      printerNickname: nickname.trim(),
      overrideIP: overrideIP.trim(),
      overridePort: overridePort.trim(),
      characterSet: characterSet.trim(),
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
    <>
      <Modal visible={editModalVisible} transparent animationType="fade" onRequestClose={onDismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {mode === 'edit' ? 'Edit Printer' : 'New Printer'}
            </Text>

            <TextInput
              label="Nickname"
              value={nickname}
              onChangeText={setNickname}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Override IP (optional)"
              value={overrideIP}
              onChangeText={setOverrideIP}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Override Port (optional)"
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

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Active</Text>
              <Switch value={active} onValueChange={setActive} />
            </View>

            <Text style={styles.switchContainer}>
              Current IP: {printer?.printerIp}:{printer?.printerPort}
            </Text>

            <View style={styles.buttonContainer}>
              <Button mode="outlined" onPress={onDismiss} style={styles.cancelButton}>
                Cancel
              </Button>
              <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
                Save
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
      <Text style={styles.printerDetails}>Print Type: {printer.printLocation}</Text>
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

  const strings = useStrings();

  const fetchPrinters = async () => {
    try {
      const response = await getRequest('/printers');
      setPrinters(response);
    } catch (error) {
      toast('error', strings.ERROR, 'Failed to fetch printers');
    }
  };

  const handlePrinterDiscovered = (freshPrinters: Printer[]) => {
    const printersDiff = freshPrinters?.filter(
      (freshPrinter) => !printers?.some((printer) => freshPrinter.printerMac === printer.printerMac)
    );

    if (!freshPrinters.length) {
      toast('error', strings.NO_PRINTERS);
    } else if (printersDiff?.length) {
      toast('success', `Found new printers!`);
    } else {
      toast('success', strings.SUCCESS);
    }

    setIsScanning(false);
    setPrinters(freshPrinters ?? []);
  };

  useEffect(() => {
    fetchPrinters();
    const subscription = EventEmitter.addListener(
      PRINTERS_DISCOVERED_UPDATE,
      handlePrinterDiscovered
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

  const handleEditPress = (printer: Printer) => {
    setSelectedPrinter(printer);
    setModalVisible(true);
  };

  const handleEditPrinter = async (updatedPrinter: Printer) => {
    setIsLoading(true);

    console.log(updatedPrinter, 'updatedPrinter');
    try {
      const response = await patchRequest(`/printers`, {
        printer: updatedPrinter,
      });
      setPrinters(response);
      toast('success', strings.SUCCESS, 'Printer updated successfully');
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

      <FAB
        icon="magnify"
        style={styles.scanFab}
        onPress={handleScanPrinters}
        loading={isScanning}
        disabled={isScanning}
        color={colors.darkGrey}
      />

      <EditModal
        visible={modalVisible}
        printer={selectedPrinter}
        onDismiss={() => {
          setModalVisible(false);
          setSelectedPrinter(null);
        }}
        onSave={handleEditPrinter}
        onDelete={handleDeletePrinter}
        mode="edit"
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
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
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
});

export default AdminPrintersScreen;
