import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../../core/theme';
import { convertNewOrderToRequestObject, getTempOrder } from '../../helpers/orderStorage';

interface TempBottomOptionsProps {
  tableName: string;
  handleOpenModal: () => void;
  handleTempOrderPress: () => void;
}

const TempBottomOptions: React.FC<TempBottomOptionsProps> = ({
  tableName,
  handleOpenModal, //opens table modal
  handleTempOrderPress, //opens additems screen
}) => {
  const handleOrderSend = async () => {
    const newOrder = await getTempOrder();

    const convertedServerOrder = convertNewOrderToRequestObject(newOrder);

    console.log(JSON.stringify(convertedServerOrder, null, 2));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.button, styles.sendOrderButton]} onPress={handleOrderSend}>
        <Text style={[styles.buttonText]}>Αποστολή</Text>
      </TouchableOpacity>
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={[styles.button, styles.tableButton]} onPress={handleOpenModal}>
          <Text style={styles.buttonText}>{tableName}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.tempOrderButton]}
          onPress={handleTempOrderPress}
        >
          <Text style={styles.buttonText}>Προσθήκη</Text>
        </TouchableOpacity>
      </View>
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
  sendOrderButton: {
    width: 100,
    backgroundColor: colors.green,
  },

  actionsContainer: {
    flexDirection: 'row',
    flex: 1,
    gap: 10,
    alignItems: 'center',
  },
  tempOrderButton: {
    flex: 1,
    backgroundColor: colors.blue,
    borderRadius: 50,
  },
  tableButton: {
    flex: 1,
    backgroundColor: colors.lightGrey,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default TempBottomOptions;
