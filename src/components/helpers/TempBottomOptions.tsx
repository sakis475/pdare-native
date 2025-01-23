// TempBottomOptions.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Keyboard } from 'react-native';
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
import CouvertFAB from '../popupModals/CouvertModal';
import { setStorage } from '../../storage/store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MoreIconHorizontal, TableIcon } from '../basic/Icons';

interface TempBottomOptionsProps {
  table: Table;
  isTempOrder: Boolean;
  handleOpenSelectTableModal: () => void;
  handleTempOrderPress: () => void;
  overrideOrderView?: boolean;
  couvertUpdated?: (couvert: number) => void;
  isSending?: boolean;
  setIsSending?: (value: boolean) => void;
  handleOpenMoreOptionsModal: () => void;
}

const TempBottomOptions: React.FC<TempBottomOptionsProps> = ({
  table,
  isTempOrder,
  handleOpenSelectTableModal,
  handleTempOrderPress,
  overrideOrderView,
  couvertUpdated,
  isSending,
  setIsSending,
  handleOpenMoreOptionsModal,
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
      setIsSending(false);
      navigateToTables();
    }
  };

  const handleOrderSend = async () => {
    setIsSending(true);
    try {
      const newOrder = await getTempOrder();
      if (!newOrder?.orderItems?.length || newOrder?.orderItems?.length === 0) {
        toast('info', strings.ADD_ITEMS_FIRST, '', 1600);
        setIsSending(false);
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
            () => {
              setIsSending(false);
            }
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
    } catch (error) {
      setIsSending(false);
      toast('error', 'Failed to send order', '', 1000);
    }
  };

  const handleCloseOrder = async () => {
    let currentOrder = table?.occupiedByOrder;
    if (isTempOrder) {
      currentOrder = await getTempOrder();
    }
    const orderId = currentOrder.id;

    // Handle reopen if order is closed
    if (currentOrder.closedAt) {
      AlertWithOptions(
        strings.REOPEN_ORDER,
        strings.REOPEN_ORDER_CONFIRM,
        async () => {
          const result = await patchRequest(`/orders/reopen/${orderId}`);
          if (result?.success === true) {
            toast('success', strings.REOPENED, '', 1000);
            navigateToTables();
          }
        },
        () => {}
      );
      return;
    }

    // Handle close if order is open
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
          await fetchOrder();
        }
      } catch (error) {
        toast('error', 'Failed to update couvert', '', 1000);
      }
    }
  };

  const isOrderClosed = order?.closedAt != null;

  return (
    <View style={styles.container}>
      <View style={styles.actionsContainer}>
        {/* {order?.createdAt
          ? (() => {
              const isReopenDisabled =
                order?.closedAt &&
                new Date().getTime() - new Date(order.closedAt).getTime() > 15 * 60 * 1000;

              return (
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.closeButton,
                    noTable ? styles.noTableBorder : null,
                    isOrderClosed
                      ? isReopenDisabled
                        ? styles.noTableOtherBtns
                        : styles.reopenButton
                      : null,
                  ]}
                  onPress={handleCloseOrder}
                  disabled={isReopenDisabled}
                >
                  <Icon
                    name={isOrderClosed ? 'refresh' : 'close-circle-outline'}
                    size={24}
                    color={
                      isReopenDisabled
                        ? colors.slightlyLighterGrey
                        : noTable
                        ? colors.green
                        : colors.white
                    }
                  />
                </TouchableOpacity>
              );
            })()
          : null} */}

        {/* <TouchableOpacity
          style={[
            styles.button,
            styles.tableButton,
            noTable ? styles.noTableBorder : tableChanged ? styles.changedTable : null,
            isOrderClosed ? styles.noTableOtherBtns : null,
          ]}
          onPress={handleOpenSelectTableModal}
          disabled={isOrderClosed}
        >
          <TableIcon
            size={24}
            color={
              isOrderClosed ? colors.slightlyLighterGrey : noTable ? colors.green : colors.white
            }
          />
        </TouchableOpacity> */}

        <TouchableOpacity
          style={[
            styles.button,
            styles.moreButton,
            noTable || isOrderClosed ? styles.noTableOtherBtns : null,
          ]}
          onPress={handleOpenMoreOptionsModal}
          disabled={noTable || isOrderClosed}
        >
          <MoreIconHorizontal
            size={24}
            color={noTable || isOrderClosed ? colors.slightlyLighterGrey : colors.white}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.tempOrderButton,
            noTable || isOrderClosed ? styles.noTableOtherBtns : null,
          ]}
          onPress={handleTempOrderPress}
          disabled={noTable || isOrderClosed}
        >
          <Icon
            name="plus-circle-outline"
            size={24}
            color={noTable || isOrderClosed ? colors.slightlyLighterGrey : colors.white}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.sendOrderButton,
            noTable || isOrderView || isOrderClosed || isSending ? styles.noTableOtherBtns : null,
          ]}
          onPress={handleOrderSend}
          disabled={noTable || isOrderView || isOrderClosed || isSending}
        >
          <Icon
            name="send"
            size={24}
            color={
              noTable || isOrderClosed || isSending ? colors.slightlyLighterGrey : colors.white
            }
          />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  tempOrderButton: {
    flex: 2,
    backgroundColor: colors.blue,
    borderRadius: 50,
  },
  moreButton: {
    flex: 1,
    backgroundColor: colors.darkerBlue,
  },
  closeButton: {
    flex: 1,
    backgroundColor: colors.veryLightRed,
  },
  reopenButton: {
    backgroundColor: colors.green,
  },
  noTableBorder: {
    borderWidth: 2,
    borderColor: colors.green,
  },
  noTableOtherBtns: {
    backgroundColor: colors.darkerGrey,
  },
  changedTable: {
    backgroundColor: colors.blue,
  },
});

export default TempBottomOptions;
