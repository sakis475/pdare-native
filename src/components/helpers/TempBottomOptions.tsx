import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../../core/theme';
import {
  clearNewOrder,
  convertNewOrderToRequestObject,
  getTempOrder,
} from '../../helpers/storage/orderStorage';
import { toast } from '../../core/utils';
import { postRequest } from '../../helpers/requests';
import { navigateToTables } from '../../navigation/AppNavigator';

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
  const [noTable, setNoTable] = useState(!tableName);

  useEffect(() => {
    setNoTable(!tableName);
  }, [tableName]);

  const handleOrderSend = async () => {
    const newOrder = await getTempOrder();
    if (!newOrder?.items?.length || newOrder?.items?.length === 0) {
      toast('info', 'Add Items First', '', 1600);
      return;
    }
    const convertedServerOrder = convertNewOrderToRequestObject(newOrder);

    const result = await postRequest('/orders', convertedServerOrder);
    if (result?.id) {
      toast('success', 'Success', '', 1000);
      clearNewOrder();
      navigateToTables();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.sendOrderButton, noTable ? styles.noTableOtherBtns : null]}
        onPress={handleOrderSend}
        disabled={noTable}
      >
        <Text style={[styles.buttonText, noTable ? styles.noTableOtherText : null]}>Αποστολή</Text>
      </TouchableOpacity>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.tableButton, noTable ? styles.noTableBorder : null]}
          onPress={handleOpenModal}
        >
          <Text style={[styles.buttonText, noTable ? styles.noTableText : null]}>
            {tableName ?? 'Επιλογή Τραπεζιού'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.tempOrderButton, noTable ? styles.noTableOtherBtns : null]}
          onPress={handleTempOrderPress}
          disabled={noTable}
        >
          <Text style={[styles.buttonText, noTable ? styles.noTableOtherText : null]}>
            Προσθήκη
          </Text>
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
  noTableText: {
    fontSize: 15,
  },
  noTableBorder: {
    borderWidth: 2,
    borderColor: colors.green,
  },
  noTableOtherBtns: { backgroundColor: colors.darkerGrey },
  noTableOtherText: { color: colors.slightlyLighterGrey },
});

export default TempBottomOptions;
