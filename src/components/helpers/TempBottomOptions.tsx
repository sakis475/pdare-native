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
import { navigateToTables } from '../../navigation/navigationUtils';
import { useStrings } from '../../core/localization/languageContext';
import CouvertFAB from '../popupModals/CouvertFAB';
import { setStorage } from '../../storage/store';

interface TempBottomOptionsProps {
  table: Table;
  isTempOrder: Boolean;
  handleOpenSelectTableModal: () => void;
  handleTempOrderPress: () => void;
  overrideOrderView?: boolean;
  couvertUpdated?: (couvert: number) => void;
}

const TempBottomOptions: React.FC<TempBottomOptionsProps> = ({
  table,
  isTempOrder,
  handleOpenSelectTableModal,
  handleTempOrderPress,
  overrideOrderView,
  couvertUpdated,
}) => {
  const [noTable, setNoTable] = useState(!table?.tableName);
  const [order, setOrder] = useState<Order>();
  const [isOrderView, setIsOrderView] = useState(true);
  const [tableChanged, setTableChanged] = useState(false);
  const strings = useStrings();

  const fetchOrder = async () => {
    let currentOrder = table?.occupiedByOrder;
    if (isTempOrder) {
      currentOrder = await getTempOrder();
    }

    if (currentOrder?.table && table?.id !== currentOrder?.table?.id) {
      setTableChanged(true);
    }

    const lastItem = currentOrder?.orderItems?.slice(-1)?.[0];
    const isAnyItemMarkedAsDeleted = currentOrder?.orderItems?.some((e) => e.markForDelete);
    setIsOrderView(overrideOrderView || (lastItem?.alreadySend && !isAnyItemMarkedAsDeleted));
    setOrder(currentOrder);
  };

  useEffect(() => {
    fetchOrder();
    setNoTable(!table?.tableName);
  }, [table]);

  const handleOrderSendSuccess = async (request: any) => {
    if (request?.id) {
      toast('success', strings.SUCCESS, '', 1000);
      await clearNewOrder();
      navigateToTables();
    }
  };

  const handleOrderSend = async () => {
    const newOrder = await getTempOrder();
    if (!newOrder?.orderItems?.length || newOrder?.orderItems?.length === 0) {
      toast('info', strings.ADD_ITEMS_FIRST, '', 1600);
      return;
    }
    const convertedServerOrder = convertNewOrderToRequestObject(newOrder);
    let result;
    if (convertedServerOrder?.orderId) {
      const itemsRemainingLength = newOrder.orderItems.filter((e) => !e.markForDelete)?.length;
      if (itemsRemainingLength === 0) {
        AlertWithOptions(
          strings.CLOSE_ORDER,
          strings.CLOSE_ORDER_NO_ITEMS,
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
    let currentOrder = table?.occupiedByOrder;
    if (isTempOrder) {
      currentOrder = await getTempOrder();
    }
    const orderId = currentOrder.id;
    AlertWithOptions(
      strings.CLOSE_ORDER,
      strings.CLOSE_ORDER_CONFIRM,
      async () => {
        const result = await patchRequest(`/orders/close/${orderId}`);
        if (result?.success === true) {
          if (currentOrder?.id === (await getTempOrder())?.id) {
            await clearNewOrder();
          }
          toast('success', strings.DELETED, '', 1000);
          navigateToTables();
        }
      },
      () => {}
    );
  };

  const handleAddCouvert = async (quantity: number) => {
    const updatedOrder = { ...order, couvert: quantity };
    setOrder(updatedOrder);

    if (isTempOrder) {
      await setStorage('newOrder', updatedOrder);
    }

    if (updatedOrder.id) {
      const newReqOrder = {
        couvert: quantity,
        table: updatedOrder.table.id,
        orderId: updatedOrder.id,
        items: [] as any,
      };

      try {
        const result = await patchRequest(`/orders/${updatedOrder.id}`, newReqOrder);
        if (result?.id) {
          if (couvertUpdated) {
            couvertUpdated(quantity);
          }
          toast('success', `Added ${quantity} couvert(s)`, '', 1000);
          // Refresh the order data after successful update
          await fetchOrder();
        }
      } catch (error) {
        toast('error', 'Failed to update couvert', '', 1000);
      }
    }
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
        <Text style={[styles.buttonText, noTable ? styles.noTableOtherText : null]}>
          {strings.SEND}
        </Text>
      </TouchableOpacity>

      <View style={styles.actionsContainer}>
        {order?.createdAt ? (
          <TouchableOpacity
            style={[styles.button, styles.closeButton, noTable ? styles.noTableBorder : null]}
            onPress={handleCloseOrder}
          >
            <Text style={[styles.buttonText, noTable ? styles.noTableText : null]}>
              {strings.CLOSE}
            </Text>
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
            {table?.tableName ?? strings.SELECT_TABLE}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.tempOrderButton, noTable ? styles.noTableOtherBtns : null]}
          onPress={handleTempOrderPress}
          disabled={noTable}
        >
          <Text style={[styles.buttonText, noTable ? styles.noTableOtherText : null]}>
            {strings.ADD}
          </Text>
        </TouchableOpacity>
      </View>
      {order && (
        <CouvertFAB
          key={`couvert-fab-${order.id}-${order.couvert}`}
          onSubmit={handleAddCouvert}
          disabled={noTable}
          couvertQuantity={order?.couvert ?? 0}
        />
      )}
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
    fontSize: 10,
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
