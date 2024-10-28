import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../../core/theme';
import {
  clearNewOrder,
  convertNewOrderToRequestObject,
  getTempOrder,
} from '../../helpers/storage/orderStorage';
import { AlertWithOptions, toast } from '../../core/utils';
import { patchRequest, postRequest } from '../../helpers/requests';
import { navigateToTables } from '../../navigation/AppNavigator';

interface TempBottomOptionsProps {
  table: Table;
  handleOpenSelectTableModal: () => void;
  handleTempOrderPress: () => void;
}

const TempBottomOptions: React.FC<TempBottomOptionsProps> = ({
  table,
  handleOpenSelectTableModal, //opens table modal
  handleTempOrderPress, //opens additems screen
}) => {
  const [noTable, setNoTable] = useState(!table?.tableName);
  const [tempOrder, setTempOrder] = useState<Order>();

  const [isOrderView, setIsOrderView] = useState(true);

  const [tableChanged, setTableChanged] = useState(false);

  const fetchTempOrder = async () => {
    let order = table?.occupiedByOrder;
    if (!table?.occupiedByOrder) {
      order = await getTempOrder();
    }

    if (order?.table && table?.id !== order?.table?.id) {
      setTableChanged(true);
    }

    const lastItem = order?.orderItems?.slice(-1)?.[0];

    const isAnyItemMarkedAsDeleted = order?.orderItems?.some((e) => e.markForDelete);
    setIsOrderView(lastItem?.alreadySend && !isAnyItemMarkedAsDeleted);
    setTempOrder(order);
  };
  useEffect(() => {
    fetchTempOrder();
    setNoTable(!table?.tableName);
  }, [table]);

  const handleOrderSendSuccess = async (request: any) => {
    if (request?.id) {
      toast('success', 'Success', '', 1000);
      await clearNewOrder();
      navigateToTables();
    }
  };
  const handleOrderSend = async () => {
    const newOrder = await getTempOrder();
    if (!newOrder?.orderItems?.length || newOrder?.orderItems?.length === 0) {
      toast('info', 'Add Items First', '', 1600);
      return;
    }
    const convertedServerOrder = convertNewOrderToRequestObject(newOrder);
    console.log(JSON.stringify(convertedServerOrder, null, 2), 'convertedServerOrder');
    let result;
    if (convertedServerOrder?.orderId) {
      const itemsRemainingLength = newOrder.orderItems.filter((e) => !e.markForDelete)?.length;
      if (itemsRemainingLength === 0) {
        AlertWithOptions(
          'Κλείσιμο Παραγγελίας',
          'Η παραγγελία θα κλείσει γιατί δεν έχει κανένα προιόν.',
          async () => {
            result = await patchRequest(
              `/orders/${convertedServerOrder?.orderId}`,
              convertedServerOrder
            );
            handleOrderSendSuccess(result);
          },
          () => {}
        );
      } else {
        result = await patchRequest(
          `/orders/${convertedServerOrder?.orderId}`,
          convertedServerOrder
        );
        handleOrderSendSuccess(result);
      }
    } else {
      result = await postRequest('/orders', convertedServerOrder);
      handleOrderSendSuccess(result);
    }
  };

  const handleCloseOrder = async () => {
    let order = table?.occupiedByOrder;
    if (!table?.occupiedByOrder) {
      order = await getTempOrder();
    }
    const orderId = order.id;
    console.log(orderId);
    AlertWithOptions(
      'Κλείσιμο Παραγγελίας',
      'Είστε σίγουροι ότι θέλετε να κλείσετε την παραγγελία;',
      async () => {
        await patchRequest(`/orders/close/${orderId}`);
        toast('success', 'Deleted', '', 1000);
        navigateToTables();
      },
      () => {}
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          styles.sendOrderButton,
          noTable || isOrderView ? styles.noTableOtherBtns : null,
        ]}
        onPress={handleOrderSend}
        disabled={noTable || isOrderView}
      >
        <Text style={[styles.buttonText, noTable ? styles.noTableOtherText : null]}>Αποστολή</Text>
      </TouchableOpacity>

      <View style={styles.actionsContainer}>
        {tempOrder?.createdAt ? (
          <TouchableOpacity
            style={[styles.button, styles.closeButton, noTable ? styles.noTableBorder : null]}
            onPress={handleCloseOrder}
          >
            <Text style={[styles.buttonText, noTable ? styles.noTableText : null]}>Κλείσιμο</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[
            styles.button,
            styles.tableButton,
            noTable ? styles.noTableBorder : tableChanged ? styles.changedTable : null,
          ]}
          onPress={handleOpenSelectTableModal}
        >
          <Text style={[styles.buttonText, noTable ? styles.noTableText : null]}>
            {table?.tableName ?? 'Επιλογή Τραπεζιού'}
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
    height: 50,
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
    flex: 2,
    backgroundColor: colors.blue,
    borderRadius: 50,
  },
  tableButton: {
    flex: 1,
    backgroundColor: colors.lightGrey,
  },
  closeButton: {
    flex: 1,
    backgroundColor: colors.veryLightRed,
  },
  buttonText: {
    color: colors.white,
    fontSize: 10,
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
  changedTable: { backgroundColor: colors.blue },
});

export default TempBottomOptions;
