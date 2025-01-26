import React from 'react';
import { StyleSheet } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { colors } from '../../core/theme';

interface ButtonConfig {
  value: string;
  label: string;
}

interface CustomSegmentedButtonsProps {
  value: string;
  onValueChange: (value: string) => void;
  buttons: ButtonConfig[];
  style?: any;
  variant?: 'light' | 'dark';
}

const CustomSegmentedButtons: React.FC<CustomSegmentedButtonsProps> = ({
  value,
  onValueChange,
  buttons,
  style,
  variant = 'light',
}) => {
  const themes = {
    light: {
      onSurface: colors.black,
      onSurfaceVariant: colors.grey,
      secondaryContainer: colors.blue,
      onSecondaryContainer: colors.white,
    },
    dark: {
      onSurface: colors.white,
      onSurfaceVariant: colors.white,
      secondaryContainer: colors.blue,
      onSecondaryContainer: colors.white,
    },
  };

  return (
    <SegmentedButtons
      value={value}
      onValueChange={onValueChange}
      buttons={buttons}
      style={[styles.segmentedButtons, style]}
      theme={{
        colors: themes[variant],
      }}
    />
  );
};

const styles = StyleSheet.create({
  segmentedButtons: {
    marginVertical: 8,
  },
});

export default CustomSegmentedButtons;
