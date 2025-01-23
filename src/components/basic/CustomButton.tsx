import React from 'react';
import { Button } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { WarningIcon } from './/Icons';
import { Text } from 'react-native-paper';
import { colors } from '../../core/theme';

interface CustomButtonProps {
  mode?: 'text' | 'outlined' | 'contained';
  onPress: () => void;
  loading?: boolean;
  style?: any;
  textColor?: string;
  children: React.ReactNode;
  variant?: 'normal' | 'delete' | 'warning';
}

const CustomButton: React.FC<CustomButtonProps> = ({
  mode = 'contained',
  onPress,
  loading = false,
  style,
  textColor,
  children,
  variant = 'normal',
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'delete':
        return [
          styles.button,
          styles.deleteButton,
          mode === 'outlined' && { borderColor: colors.lightRed },
          mode === 'contained' && { backgroundColor: colors.lightRed },
          style,
        ];
      case 'warning':
        return [
          styles.button,
          styles.warningButton,
          mode === 'outlined' && { borderColor: colors.lightRed },
          style,
        ];
      default:
        return [styles.button, style];
    }
  };

  const renderContent = () => {
    if (variant === 'warning') {
      return (
        <View style={styles.buttonInner}>
          <WarningIcon size={20} color={colors.veryLighterRed} />
          <Text style={styles.warningButtonText}>{children}</Text>
          <WarningIcon size={20} color={colors.veryLighterRed} />
        </View>
      );
    }
    return children;
  };

  return (
    <Button
      mode={mode}
      onPress={onPress}
      loading={loading}
      style={getButtonStyle()}
      textColor={textColor || (variant === 'delete' ? colors.white : undefined)}
    >
      {renderContent()}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
    alignItems: 'center',
  },
  deleteButton: {
    marginTop: 16,
  },
  warningButton: {
    marginTop: 16,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningButtonText: {
    color: colors.lightRed,
    fontSize: 16,
  },
});

export default CustomButton;
