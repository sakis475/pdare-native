import React, { useState } from 'react';
import { Button } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { WaitingIcon, WarningIcon } from './Icons';
import { Text } from 'react-native-paper';
import { colors } from '../../core/theme';

interface CustomButtonProps {
  mode?: 'text' | 'outlined' | 'contained';
  onPress: (e: any) => any;
  loading?: boolean;
  disabled?: boolean;
  style?: any;
  contentStyle?: any;
  textColor?: string;
  children: React.ReactNode;
  variant?: 'normal' | 'delete' | 'warning';
  debounce?: number; // New optional parameter with default value of 0 seconds
}

const CustomButton: React.FC<CustomButtonProps> = ({
  mode = 'contained',
  onPress,
  loading = false,
  disabled = false,
  style,
  contentStyle,
  textColor = colors.white,
  children,
  variant = 'normal',
  debounce = 0, // Default is 0 (no limit)
}) => {
  const [isTapLimited, setIsTapLimited] = useState(false);

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
        return [
          styles.button,
          {
            backgroundColor: mode === 'outlined' ? null : colors.blue,
          },
          style,
        ];
    }
  };

  const renderContent = () => {
    if (variant === 'warning') {
      return (
        <>
          <WarningIcon size={20} color={colors.danger} />
          <Text style={styles.warningButtonText}>{children}</Text>
          <WarningIcon size={20} color={colors.danger} />
        </>
      );
    } else {
      return <Text style={{ color: colors.white, textAlign: 'center' }}>{children}</Text>;
    }
  };

  const handlePress = (e: any) => {
    if (debounce > 0 && !isTapLimited) {
      setIsTapLimited(true);
      onPress(e);

      // Set a timeout to re-enable the button after the specified time
      setTimeout(() => {
        setIsTapLimited(false);
      }, debounce * 1000); // Convert seconds to milliseconds
    } else if (debounce === 0) {
      // If no tap limit is set, just call onPress directly
      onPress(e);
    }
  };

  return (
    <Button
      mode={mode}
      onPress={handlePress}
      disabled={disabled || loading || isTapLimited}
      style={[getButtonStyle(), (loading || isTapLimited) && { backgroundColor: 'grey' }]}
      textColor={textColor || (variant === 'delete' ? colors.white : undefined)}
      contentStyle={[styles.contentStyle, contentStyle]}
      labelStyle={styles.labelStyle}
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
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 8,
  },
  warningButtonText: {
    color: colors.lightRed,
    fontSize: 16,
    textAlign: 'center',
  },
  contentStyle: {
    width: '100%',
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelStyle: {
    flexGrow: 1,
  },
});

export default CustomButton;
