import React from 'react';
import { Text } from 'react-native';
import { colors } from '../../core/theme';
import GlobalStore from '../../storage/GlobalStore';

export function CurrencyFormat({
  value,
  currency,
  color = colors.white,
  fontSize = 16,
  quantity,
}: {
  value: number;
  currency: string;
  color?: string;
  fontSize?: number;
  quantity?: number;
}) {
  if (typeof value !== 'number') {
    return null;
  }

  if (GlobalStore.getInstance().hasValue('currencySymbol')) {
    currency = GlobalStore.getInstance().getValue('currencySymbol');
  }
  return (
    <Text style={{ color: color, fontSize }}>
      <Text style={{ color: color, fontSize, fontWeight: 'bold' }}>
        {quantity ? `${quantity} x ` : ''}
      </Text>
      {currency} {value.toFixed(2)}
    </Text>
  );
}
