import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text } from 'react-native';
import { Portal, Button } from 'react-native-paper';
import { colors } from '../../core/theme';
import { useStrings } from '../../core/localization/languageContext';
import CustomNumberInput from '../basic/CustomNumberInput';
import BaseModal from '../basic/BaseModal';

interface CouvertModalProps {
  couvertQuantity: number;
  onSubmit: (quantity: number) => void;
  isModalVisible: boolean; // New prop to control modal visibility
  onModalClose?: () => void; // New prop to handle modal closing
}

const CouvertModal: React.FC<CouvertModalProps> = ({
  couvertQuantity,
  onSubmit,
  isModalVisible,
  onModalClose,
}) => {
  const [quantity, setQuantity] = useState<number>(couvertQuantity ?? 0);
  const strings = useStrings();

  const handleSubmit = () => {
    onSubmit(quantity);
    onModalClose();
  };

  const handleDismiss = () => {
    setQuantity(couvertQuantity);
    onModalClose();
  };

  const handleQuantityChange = (value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      setQuantity(numValue);
    }
  };

  const renderQuickSelectButtons = () => {
    const rows = [
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [8, 9, 10, 11],
    ];

    return (
      <View style={styles.quickSelectContainer}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.quickSelectRow}>
            {row.map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.quickSelectButton,
                  quantity === num && styles.quickSelectButtonSelected,
                ]}
                onPress={() => setQuantity(num)}
              >
                <Text
                  style={[
                    styles.quickSelectText,
                    quantity === num && styles.quickSelectTextSelected,
                  ]}
                >
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const handleConfirm = () => {
    handleSubmit();
  };

  return (
    <Portal>
      <BaseModal
        title={strings.SELECT_COUVERT}
        visible={isModalVisible}
        onClose={onModalClose}
        onConfirm={handleConfirm}
        theme={'dark'}
      >
        <View>
          {renderQuickSelectButtons()}

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>{strings.OR_CUSTOM_AMOUNT}</Text>
            <View style={styles.divider} />
          </View>

          <CustomNumberInput
            label={strings.SELECT_COUVERT}
            value={quantity}
            onChangeText={handleQuantityChange}
            min={1}
            max={99}
            showButtons
            style={styles.input}
            key={isModalVisible ? 'input-open' : 'input-closed'}
          />
        </View>
      </BaseModal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 50,
    backgroundColor: colors.primary,
  },
  fabDisabled: {
    backgroundColor: colors.darkerGrey,
  },
  fabIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fabQuantityText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    // backgroundColor: colors.grey,
    // padding: 20,
    // borderRadius: 10,
    // width: '80%',
    // maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 20,
    textAlign: 'center',
  },
  quickSelectContainer: {
    marginBottom: 20,
  },
  quickSelectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quickSelectButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.darkGrey,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: colors.lightGrey,
  },
  quickSelectButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickSelectText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickSelectTextSelected: {
    color: colors.white,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.lightGrey,
  },
  dividerText: {
    color: colors.lightGrey,
    paddingHorizontal: 10,
    fontSize: 12,
  },
  input: {
    marginBottom: 20,
  },
  buttonText: {
    color: colors.white,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 5,
    minWidth: 100,
  },
  buttonLabel: {
    fontSize: 12,
    lineHeight: 20,
  },
  buttonContent: {
    height: 40,
    paddingHorizontal: 8,
  },
  confirmButton: {
    backgroundColor: colors.green,
  },
});

export default CouvertModal;
