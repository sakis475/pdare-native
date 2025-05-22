import { StyleSheet, Text, View } from 'react-native';
import { ClockIcon, CouvertIcon, TableIcon, UserIcon } from '../basic/Icons';
import { colors } from '../../core/theme';
import dayjs from '../../core/dayjs';
import { useStrings } from '../../core/localization/languageContext';
import { CurrencyFormat } from './CurrencyFormat';
import { Order } from '../../types/basic.types';
import { useEffect, useState } from 'react';
import { getStorage } from '../../storage/store';

export const OrderInfoBar = ({
  order,
  containerStyle,
  hideTableName,
}: {
  order: Order;
  containerStyle?: any;
  hideTableName?: boolean;
}) => {
  const strings = useStrings();

  const [tempFinalCost, setTempFinalCost] = useState(0);

  const calculateTempCost = async () => {
    const user = await getStorage('currentUser');

    const couvertCost = Number(user?.restaurant?.couvertCost) || 0;
    const couvertCount = Number(order?.couvert) || 0;
    const couvertCalc = couvertCount * couvertCost;

    const itemsTotal =
      order?.orderItems
        ?.filter((item) => !item.markForDelete)
        ?.reduce((total, item) => {
          const itemCost = Number(item.cost) || 0;
          const itemQty = Number(item.quantity) || 0;
          return total + itemCost * itemQty;
        }, 0) || 0;

    let tempFinalCost = couvertCalc + itemsTotal;

    // Final safeguard against NaN
    tempFinalCost = isNaN(tempFinalCost) ? 0 : tempFinalCost;

    setTempFinalCost(tempFinalCost);
  };

  useEffect(() => {
    calculateTempCost();
  }, [order]);

  return (
    <View style={[styles.orderInfoContainer, containerStyle]}>
      <View style={styles.tableInfoContainer}>
        <View style={styles.infoRow}>
          <View style={styles.leftSection}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoText, { fontSize: 20, fontWeight: 'bold' }]}>
                {order?.uniqueId ? order.uniqueId : '#'}
              </Text>
            </View>
            {order?.finalCost && (
              <View style={styles.infoItem}>
                <Text style={[styles.infoText, { fontSize: 20 }]}>
                  <CurrencyFormat value={order.finalCost} currency="€"></CurrencyFormat>
                </Text>
              </View>
            )}
            {typeof tempFinalCost === 'number' &&
              tempFinalCost.toFixed(2) !== order?.finalCost?.toFixed(2) && (
                <View
                  style={[
                    styles.infoItem,
                    { borderColor: colors.orange, borderWidth: 1, borderRadius: 5, padding: 3 },
                  ]}
                >
                  <Text style={[styles.infoText, { fontSize: 10 }]}>
                    <CurrencyFormat
                      value={tempFinalCost}
                      currency="€"
                      fontSize={10}
                      color={colors.orange}
                    ></CurrencyFormat>
                  </Text>
                </View>
              )}
          </View>
          <View style={styles.userSection}>
            {!hideTableName && (
              <View style={styles.infoItem}>
                <TableIcon size={20}></TableIcon>
                <Text style={[styles.infoText, { fontSize: 18 }]}>
                  {order?.table?.tableName ? order?.table?.tableName : ''}
                </Text>
              </View>
            )}
            <UserIcon size={20} color={colors.white} />
            <Text style={styles.infoText}>{order?.user?.displayName || '--'}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.leftSection}>
            <View style={[styles.infoItem]}>
              <ClockIcon size={20} color={colors.white} style={{ paddingRight: 2 }} />
              <Text style={styles.infoText}>
                {order?.createdAt &&
                (order?.closedAt || dayjs(order.createdAt).isBefore(dayjs().subtract(6, 'hours')))
                  ? dayjs(order.createdAt).format('HH:mm DD/MM/YY')
                  : order?.createdAt
                  ? dayjs(order.createdAt).format('HH:mm')
                  : '--:--'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <CouvertIcon size={20} color={colors.white} style={{ paddingRight: 2 }} />
              <Text style={styles.infoText}>{order?.couvert ?? '--'}</Text>
            </View>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.leftSection}>
            {order?.closedAt && (
              <View style={styles.infoItem}>
                <ClockIcon size={20} color={colors.white} style={{ paddingRight: 2 }} />
                <Text style={[styles.infoText, { color: colors.lightRed }]}>
                  {`${dayjs(order.closedAt).format('HH:mm DD/MM/YY')} (${strings.CLOSED})`}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  orderInfoContainer: {
    backgroundColor: colors.slightlyDarkerGrey,
    width: '100%',
  },

  tableInfoContainer: {
    width: '100%',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 1.5,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  infoText: {
    fontSize: 16,
    color: colors.white,
    minWidth: 20,
  },

  divider: {
    paddingHorizontal: 8,
  },

  dividerText: {
    color: colors.white,
    fontSize: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // For items that might need different widths
  idColumn: {
    width: 80, // Smaller width for order ID
  },
  tableColumn: {
    width: 120, // Width for table name
  },
  timeColumn: {
    width: 150, // Wider for timestamps
  },
});
