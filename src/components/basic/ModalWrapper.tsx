import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import CustomButton from './CustomButton';
import { useStrings } from '../../core/localization/languageContext';

type ModalWrapperProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  testID?: string;
};

const ModalWrapper: React.FC<ModalWrapperProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  children,
  testID,
}) => {
  const strings = useStrings();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      testID={testID}
    >
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.title}>{title}</Text>

              <ScrollView style={styles.scrollContent}>{children}</ScrollView>

              <View style={styles.footer}>
                <CustomButton mode="outlined" onPress={onClose} style={styles.cancelButton}>
                  {strings.CANCEL}
                </CustomButton>
                <CustomButton mode="contained" onPress={onConfirm} style={styles.confirmButton}>
                  {strings.SAVE}
                </CustomButton>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#666',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  confirmButton: {
    flex: 2,
    marginLeft: 8,
  },
  cancelText: {
    color: '#666',
  },
  confirmText: {
    color: 'white',
  },
});

export default ModalWrapper;
