import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Keyboard } from 'react-native';
import { colors } from '../../core/theme';
import { strings } from '../../core/strings';
import TempOrderBottomSheet from '../../components/bottomSheets/TempOrderBottomSheet';
import { Portal } from '@gorhom/portal';

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
  //START TEMP ORDER MODAL LOGIC
  const bottomTempOrderSheetRef = useRef<{ openModal: () => void; closeModal: () => void }>(null);

  const handleTempOrderOpenModal = () => {
    bottomTempOrderSheetRef.current?.openModal();
  };

  const handleTempOrderCloseModal = () => {
    bottomTempOrderSheetRef.current?.closeModal();
    Keyboard.dismiss();
  };
  //END TEMP ORDER MODAL LOGIC

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.tempOrderButton]}
        onPress={handleTempOrderOpenModal}
      >
        <Text style={styles.buttonText}>{strings.DraftOrder}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.tableButton]} onPress={handleOpenModal}>
        <Text style={styles.buttonText}>{tableName}</Text>
      </TouchableOpacity>
      <Portal>
        <TempOrderBottomSheet ref={bottomTempOrderSheetRef} />
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 4,
    backgroundColor: colors.darkerGrey,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    borderRadius: 6,
    marginHorizontal: 20,
    height: 60,
    width: 60,
  },
  tempOrderButton: {
    flex: 2,
    backgroundColor: 'green',
  },
  tableButton: {
    backgroundColor: 'blue',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default OrderBottomOptions;
