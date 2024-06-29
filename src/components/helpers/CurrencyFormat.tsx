import React from 'react';
import { Text, View } from 'react-native';

export function CurrencyFormat({ value, currency }: { value: number; currency: string }) {
  return (
    <View>
      <Text>
        {currency} {value.toFixed(2)}
      </Text>
    </View>
  );
}
