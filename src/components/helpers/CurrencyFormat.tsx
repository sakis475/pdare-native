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
  return (
    <View>
      <Text style={{ color: color, fontSize }}>
        {quantity ? `(${quantity}) ` : ''}
        {currency} {value.toFixed(2)}
      </Text>
    </View>
  );
}
