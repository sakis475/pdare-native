import React from 'react';
import { Text, View } from 'react-native';

export function CurrencyFormat({
  value,
  currency,
  color = '#ffffff',
  fontSize = 16,
}: {
  value: number;
  currency: string;
  color?: string;
  fontSize?: number;
}) {
  return (
    <View>
      <Text style={{ color: color, fontSize }}>
        {currency} {value.toFixed(2)}
      </Text>
    </View>
  );
}
