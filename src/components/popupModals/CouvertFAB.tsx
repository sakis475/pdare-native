import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, ScrollView } from 'react-native';
import { Portal, FAB, Button } from 'react-native-paper';
import { colors } from '../../core/theme';
import { useStrings } from '../../core/localization/languageContext';
import CustomNumberInput from '../basic/CustomNumberInput';
import { CouvertIcon } from '../basic/Icons';

interface CouvertFABProps {
  couvertQuantity: number;
  onSubmit: (quantity: number) => void;
  disabled?: boolean;
  style?: any;
}

const CouvertFAB: React.FC<CouvertFABProps> = ({
  couvertQuantity,
  onSubmit,
  disabled = false,
  style,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [quantity, setQuantity] = useState<number>(couvertQuantity ?? 0);
  const strings = useStrings();

  const handleSubmit = () => {
    onSubmit(quantity);
    setIsModalVisible(false);
  };

  const handleDismiss = () => {
    setQuantity(couvertQuantity);
    setIsModalVisible(false);
  };

  const handleQuantityChange = (value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      setQuantity(numValue);
    }
  };

  const renderQuickSelectButtons = () => {
    const rows = [
      [1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10],
      [11, 12, 13, 14, 15],
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

  const CustomFabIcon = () => (
    <View style={styles.fabIconContainer}>
      <CouvertIcon size={16} />
      <Text style={styles.fabQuantityText}>{quantity}</Text>
    </View>
  );

  return (
    <>
      <FAB
        icon={() => <CustomFabIcon key={`fab-icon-${quantity}`} />}
        style={[styles.fab, disabled && styles.fabDisabled, style]}
        onPress={() => setIsModalVisible(true)}
        disabled={disabled}
        color={colors.lighterGrey}
        animated={false}
      />
      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={handleDismiss}
          transparent
          animationType="fade"
          key={isModalVisible ? 'modal-open' : 'modal-closed'}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.title}>{strings.SELECT_COUVERT}</Text>

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

              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  onPress={handleDismiss}
                  style={styles.button}
                  textColor={colors.lightRed}
                  labelStyle={styles.buttonLabel}
                  contentStyle={styles.buttonContent}
                >
                  {strings.CANCEL}
                </Button>
                <Button
                  mode="contained"
                  style={[styles.button, styles.confirmButton]}
                  onPress={handleSubmit}
                  textColor={colors.white}
                  labelStyle={styles.buttonLabel}
                  contentStyle={styles.buttonContent}
                >
                  {strings.SAVE}
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </Portal>
    </>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.grey,
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxWidth: 400,
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

export default CouvertFAB;
