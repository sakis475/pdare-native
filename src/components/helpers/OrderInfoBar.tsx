import { StyleSheet, Text, View } from 'react-native';
import { ClockIcon, CouvertIcon, TableIcon, UserIcon } from '../basic/Icons';
import { colors } from '../../core/theme';
import dayjs from '../../core/dayjs';

export const OrderInfoBar = ({ order, containerStyle }: { order: Order; containerStyle?: any }) => {
  return (
    <View style={[styles.orderInfoContainer, containerStyle]} testID="order-info-container">
      <View style={styles.tableInfoContainer}>
        <View style={styles.infoRow}>
          <View style={styles.leftSection}>
            <View style={styles.infoItem}>
              <ClockIcon size={20} color={colors.white} />
              <Text style={styles.infoText}>
                {order?.createdAt ? dayjs(order.createdAt).format('HH:mm') : '--:--'}
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

          <View style={styles.userSection}>
            <UserIcon size={20} color={colors.white} />
            <Text style={styles.infoText}>{order?.user?.displayName || '--'}</Text>
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
