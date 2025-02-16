import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Portal } from 'react-native-paper';
import { colors } from '../../core/theme';
import { useStrings } from '../../core/localization/languageContext';
import BaseModal from '../basic/BaseModal';
import { Inventory } from '../../types/basic.types';
import dayjs from '../../core/dayjs';

interface OrderLimitModalProps {
  isModalVisible: boolean; // New prop to control modal visibility
  inventory: Inventory;
  onDismiss: () => void;
}

const OrderLimitModal: React.FC<OrderLimitModalProps> = ({
  isModalVisible,
  onDismiss,
  inventory,
}) => {
  const strings = useStrings();
  const currentLimitCount = inventory?.currentLimitCount ?? '?';
  const restaurantLimit = inventory?.restaurant.orderDailyLimit ?? '?';
  const currentLimitEnd = inventory?.currentLimitEnd ?? dayjs().add(1, 'day');

  return (
    <Portal>
      <BaseModal
        title={strings.DAILY_ORDER_LIMIT_TITLE} // Localized title
        visible={isModalVisible}
        onClose={onDismiss}
        onConfirm={() => {}}
        theme={'dark'}
        buttonVariant={'okOnly'}
      >
        <View style={{ gap: 4 }}>
          <Text style={{ color: colors.white }}>• {strings.APP_FREE_NO_ADS}</Text>
          <Text style={{ color: colors.white }}>• {strings.DAILY_LIMIT_EXPLANATION}</Text>
          <Text style={{ color: colors.white }}>• {strings.LIMIT_REMOVAL_PLAN}</Text>
          <Text style={{ color: colors.white }}>
            • {strings.DAILY_LIMIT_PART_A} {restaurantLimit} {strings.DAILY_LIMIT_PART_B}
          </Text>
          <Text style={{ color: colors.white }}>• {strings.LIMIT_START_EXPLANATION}</Text>
          <Text style={{ color: colors.white, marginTop: 10 }}>
            {strings.CURRENT_LIMIT_PART_A} {currentLimitCount} {strings.CURRENT_LIMIT_PART_B}{' '}
            {restaurantLimit} {strings.CURRENT_LIMIT_PART_C}
          </Text>
          <Text style={{ color: colors.white, marginTop: 5 }}>
            {strings.LIMIT_RESET_PART_A} {dayjs(currentLimitEnd).format('DD/MM - HH:mm')}
          </Text>
        </View>
      </BaseModal>
    </Portal>
  );
};

const styles = StyleSheet.create({});

export default OrderLimitModal;
