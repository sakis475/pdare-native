import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, FlatList } from 'react-native';
import { AlertWithOptions, toast } from '../../core/utils';
import { colors } from '../../core/theme';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { TextInput, Button } from 'react-native-paper';
import { ActivityIndicator, FAB } from 'react-native-paper';
import { LoadingOverlay } from '../../components/basic/SavingOverlay';
import { getRequest, patchRequest, postRequest } from '../../helpers/requests';
import { useStrings } from '../../core/localization/languageContext';
import { EventEmitter, PRINTERS_DISCOVERED_UPDATE } from '../../helpers/Sockets/EventEmitter';

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

const EditModal: React.FC<EditModalProps> = ({
  visible,
  printer,
  onDismiss,
  onSave,
  onDelete,
  mode,
}) => {
  const [nickname, setNickname] = useState(printer?.printerNickname || '');
  const [overrideIP, setOverrideIP] = useState(printer?.overrideIP || '');
  const [overridePort, setOverridePort] = useState(printer?.overridePort || '');
  const [characterSet, setCharacterSet] = useState(printer?.characterSet || '');
  const [printLocation, setPrintLocation] = useState(printer?.printLocation || PrintLocation.ALL);

  const strings = useStrings();

  useEffect(() => {
    if (printer) {
      setNickname(printer.printerNickname);
      setOverrideIP(printer.overrideIP || '');
      setOverridePort(printer.overridePort || '');
      setCharacterSet(printer.characterSet || '');
      setPrintLocation(printer.printLocation || PrintLocation.ALL);
    }
  }, [printer]);

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
      printLocation,
    });
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{mode === 'edit' ? 'Edit Printer' : 'New Printer'}</Text>

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

          <TextInput
            label="Character Set"
            value={characterSet}
            onChangeText={setCharacterSet}
            style={styles.input}
            mode="outlined"
          />

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
  );
};

const PrinterItem = ({ printer, onEdit }: { printer: Printer; onEdit: any }) => (
  <TouchableOpacity style={styles.printerItem} onPress={() => onEdit(printer)}>
    <View style={styles.printerInfo}>
      <Text style={styles.printerName}>{printer.printerNickname}</Text>
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

  useEffect(() => {
    fetchPrinters();

    const subscription = EventEmitter.addListener(
      PRINTERS_DISCOVERED_UPDATE,
      (printers: Printer[]) => setPrinters(printers ?? [])
    );

    return () => subscription.remove();
  }, []);

  const handleScanPrinters = async () => {
    setIsScanning(true);
    try {
      await postRequest('/printers/requestScan');
      toast('success', strings.SUCCESS, 'Scanning for printers...');
      await fetchPrinters();
    } catch (error) {
      toast('error', strings.ERROR, 'Failed to scan for printers');
    } finally {
      setIsScanning(false);
    }
  };

  const handleEditPress = (printer: Printer) => {
    setSelectedPrinter(printer);
    setModalVisible(true);
  };

  const handleEditPrinter = async (updatedPrinter: Printer) => {
    setIsLoading(true);
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
          data={printers.filter((printer) => printer.active !== false)}
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
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
});

export default AdminPrintersScreen;
