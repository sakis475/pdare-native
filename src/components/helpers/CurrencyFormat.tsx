import React from 'react';
import { Text, View } from 'react-native';
import { colors } from '../../core/theme';

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
  return (
    <Text style={{ color: color, fontSize }}>
      <Text style={{ color: color, fontSize, fontWeight: 'bold' }}>
        {quantity ? `${quantity} x ` : ''}
      </Text>
      {currency} {value.toFixed(2)}
    </Text>
  );
}
