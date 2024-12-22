import { StyleSheet, Text, View } from 'react-native';
import { ClockIcon, CouvertIcon, TableIcon, UserIcon } from '../basic/Icons';
import { colors } from '../../core/theme';
import dayjs from '../../core/dayjs';
import { useStrings } from '../../core/localization/languageContext';

export const OrderInfoBar = ({ order, containerStyle }: { order: Order; containerStyle?: any }) => {
  const strings = useStrings();
  return (
    <View style={[styles.orderInfoContainer, containerStyle]} testID="order-info-container">
      <View style={styles.tableInfoContainer}>
        <View style={styles.infoRow}>
          <View style={styles.leftSection}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoText, { fontSize: 20, fontWeight: 'bold' }]}>
                {order?.uniqueId ? order.uniqueId : '#'}
              </Text>
            </View>
          </View>
          <View style={styles.userSection}>
            <UserIcon size={20} color={colors.white} />
            <Text style={styles.infoText}>{order?.user?.displayName || '--'}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.leftSection}>
            <View style={styles.infoItem}>
              <ClockIcon size={20} color={colors.white} />
              <Text style={styles.infoText}>
                {order?.createdAt && order?.closedAt
                  ? dayjs(order.createdAt).format('HH:mm DD/MM/YY')
                  : order?.createdAt
                  ? dayjs(order.createdAt).format('HH:mm')
                  : '--:--'}
              </Text>
            </View>
            <View style={styles.divider}>
              <Text style={styles.dividerText}>|</Text>
            </View>
            <View style={styles.infoItem}>
              <CouvertIcon size={20} color={colors.white} />
              <Text style={styles.infoText}>{order?.couvert ?? 0}</Text>
            </View>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.leftSection}>
            {order?.closedAt && (
              <View style={styles.infoItem}>
                <ClockIcon size={20} color={colors.veryLightRed} />
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

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 50,
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
});
