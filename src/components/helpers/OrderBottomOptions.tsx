import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Keyboard } from 'react-native';
import { colors } from '../../core/theme';
import TempOrderBottomSheet from '../../components/bottomSheets/TempOrderBottomSheet';
import { Portal } from '@gorhom/portal';
import { navigateToDraft } from '../../navigation/navigationUtils';
import { useStrings } from '../../core/localization/languageContext';

interface OrderBottomOptionsProps {
  tableName: string;
  handleOpenModal: () => void;
  handleTempOrderPress: () => void;
}

const OrderBottomOptions: React.FC<OrderBottomOptionsProps> = ({
  tableName,
  handleOpenModal,
  handleTempOrderPress,
}) => {
  // START TEMP ORDER MODAL LOGIC
  const bottomTempOrderSheetRef = useRef<{ openModal: () => void; closeModal: () => void }>(null);

  const strings = useStrings();
  const handleTempOrderOpenModal = () => {
    bottomTempOrderSheetRef.current?.openModal();
  };

  const handleGoToTempOrderScreen = () => {
    navigateToDraft();
  };

  const handleTempOrderCloseModal = () => {
    bottomTempOrderSheetRef.current?.closeModal();
    Keyboard.dismiss();
  };
  // END TEMP ORDER MODAL LOGIC

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.tempOrderScreenBtn]}
        onPress={handleGoToTempOrderScreen}
      >
        <Text style={styles.buttonText}>{strings.ORDER}</Text>
      </TouchableOpacity>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.previewTempOrderBtn]}
          onPress={handleTempOrderOpenModal}
        >
          <Text style={styles.buttonText}>{strings.PREVIEW}</Text>
        </TouchableOpacity>
      </View>
      <Portal>
        <TempOrderBottomSheet ref={bottomTempOrderSheetRef} />
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
    backgroundColor: colors.grey,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    borderRadius: 6,
    height: 60,
    width: 60,
  },
  actionsContainer: {
    flexDirection: 'row',
    flex: 1,
    gap: 10,
    alignItems: 'center',
  },
  tempOrderScreenBtn: {
    width: 100,
    backgroundColor: 'green',
  },
  previewTempOrderBtn: {
    flex: 1,
    backgroundColor: 'blue',
  },
  tableButton: {
    width: 100,
    backgroundColor: colors.lightGrey,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default OrderBottomOptions;
