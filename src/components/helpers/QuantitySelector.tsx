import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { colors } from '../../core/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import _ from 'lodash';
import { useStrings } from '../../core/localization/languageContext';

interface QuantitySelectorProps {
  quantity: number;
  quantityChange: (quantity: number) => void;
  removeItem: () => void;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity: propQuantity,
  quantityChange,
  removeItem,
}) => {
  const [localQuantity, setLocalQuantity] = useState(propQuantity || 1);
  const [showDeleteBtn, setShowDeleteBtn] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempQuantity, setTempQuantity] = useState('');
  const trashIconTimerRef = useRef<NodeJS.Timeout>();
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const strings = useStrings();

  const textInputRef = useRef<any>(null); // TextInput ref

  // Debounced update function
  const debouncedQuantityChange = useCallback(
    _.debounce((newQuantity: number) => {
      quantityChange(newQuantity);
    }, 300),
    [quantityChange]
  );

  // Sync with prop changes only if enough time has passed
  useEffect(() => {
    const timeSinceLastUpdate = Date.now() - lastUpdateTimeRef.current;
    if (timeSinceLastUpdate > 300) {
      setLocalQuantity(propQuantity || 1);
    }
  }, [propQuantity]);

  const handleIncrement = useCallback(() => {
    if (showDeleteBtn) {
      setShowDeleteBtn(false);
      return;
    }

    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 100) {
      return; // Prevent too rapid updates
    }

    lastUpdateTimeRef.current = now;
    const newQuantity = localQuantity + 1;
    setLocalQuantity(newQuantity);
    debouncedQuantityChange(newQuantity);
  }, [localQuantity, showDeleteBtn, debouncedQuantityChange]);

  const handleDecrement = useCallback(() => {
    if (localQuantity > 1) {
      const now = Date.now();
      if (now - lastUpdateTimeRef.current < 100) {
        return; // Prevent too rapid updates
      }

      lastUpdateTimeRef.current = now;
      const newQuantity = localQuantity - 1;
      setLocalQuantity(newQuantity);
      debouncedQuantityChange(newQuantity);
    } else if (showDeleteBtn) {
      if (trashIconTimerRef.current) {
        clearTimeout(trashIconTimerRef.current);
      }
      removeItem();
      setShowDeleteBtn(false);
    } else if (localQuantity === 1) {
      setShowDeleteBtn(true);
    }
  }, [localQuantity, showDeleteBtn, debouncedQuantityChange, removeItem]);

  useEffect(() => {
    if (showDeleteBtn) {
      trashIconTimerRef.current = setTimeout(() => {
        setShowDeleteBtn(false);
      }, 3000);
    }

    return () => {
      if (trashIconTimerRef.current) {
        clearTimeout(trashIconTimerRef.current);
      }
    };
  }, [showDeleteBtn]);

  useEffect(() => {
    if (isModalVisible) {
      const keyboardTimer = setTimeout(() => {
        textInputRef.current?.focus();
        Keyboard.dismiss(); // First dismiss any existing keyboard
        setTimeout(() => {
          textInputRef.current?.focus(); // Then try to focus again
        }, 50);
      }, 100);

      return () => clearTimeout(keyboardTimer);
    }
  }, [isModalVisible]);

  const handleQuantityInputChange = (text: string) => {
    // Only allow numbers
    const numericValue = text.replace(/[^0-9]/g, '');

    // Convert to number and check if it's greater than 0
    const value = parseInt(numericValue, 10);
    if (value >= 0 || numericValue === '') {
      setTempQuantity(numericValue);
    }
  };

  const handleModalSubmit = () => {
    const newQuantity = parseInt(tempQuantity);
    if (!isNaN(newQuantity) && newQuantity >= 0 && newQuantity <= 999) {
      if (newQuantity === 0) {
        removeItem();
      }

      setLocalQuantity(newQuantity);
      debouncedQuantityChange(newQuantity);
    }
    setIsModalVisible(false);
    setTempQuantity('');
  };

  const openQuantityModal = () => {
    setTempQuantity(localQuantity.toString());
    setIsModalVisible(true);
  };

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={handleDecrement} activeOpacity={0.6}>
          {showDeleteBtn ? (
            <Icon name="trash-can-outline" size={22} color={colors.danger} />
          ) : (
            <Text style={styles.buttonText}>-</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quantityContainer}
          onPress={openQuantityModal}
          activeOpacity={0.6}
        >
          <Text style={styles.quantityText}>{localQuantity}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleIncrement} activeOpacity={0.6}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{strings.ENTER_QUANTITY}</Text>
            <TextInput
              ref={textInputRef}
              style={styles.input}
              keyboardType="number-pad"
              value={tempQuantity}
              onChangeText={handleQuantityInputChange}
              maxLength={3}
              autoFocus={true}
              selectTextOnFocus={true}
              onSubmitEditing={handleModalSubmit}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>{strings.CANCEL}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleModalSubmit}
              >
                <Text style={styles.modalButtonText}>{strings.SAVE}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.darkGrey,
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    alignItems: 'center',
  },
  modalTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 5,
    width: '100%',
    padding: 10,
    fontSize: 16,
    color: colors.darkGrey,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: colors.white,
    textAlign: 'center',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: colors.danger,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkGrey,
    borderRadius: 5,
    paddingHorizontal: 8,
  },
  button: {
    width: 33,
    height: 33,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#555',
    borderRadius: 6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  quantityContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    minWidth: 32,
  },
  quantityText: {
    color: colors.white,
    fontSize: 14,
  },
});

export default React.memo(QuantitySelector);
