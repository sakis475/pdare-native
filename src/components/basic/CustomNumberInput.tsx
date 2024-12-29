import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Text, IconButton } from 'react-native-paper';
import { colors } from '../../core/theme';
import { MinusIcon, PlusIcon } from './Icons';
import { useStrings } from '../../core/localization/languageContext';

interface CustomNumberInputProps {
  label: string;
  value: string | number;
  onChangeText: (text: string) => void;
  min?: number;
  max?: number;
  step?: number;
  allowDecimals?: boolean;
  showButtons?: boolean;
  style?: any;
  disabled?: boolean;
  decimalPlaces?: number;
}

const CustomNumberInput: React.FC<CustomNumberInputProps> = ({
  label,
  value,
  onChangeText,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  allowDecimals = false,
  showButtons = false,
  style,
  disabled = false,
  decimalPlaces = 2,
  ...props
}) => {
  const [error, setError] = useState<string>('');
  const strings = useStrings();

  const validateNumber = (text: string): boolean => {
    if (text === '') return true;

    const numberValue = Number(text);
    if (isNaN(numberValue)) return false;

    if (!allowDecimals && text.includes('.')) return false;
    if (numberValue < min || numberValue > max) return false;

    return true;
  };

  const handleTextChange = (text: string) => {
    if (text === '' || text === '-') {
      setError('');
      onChangeText(text);
      return;
    }

    if (allowDecimals) {
      if (text === '.') {
        setError('');
        onChangeText('0.');
        return;
      }

      const parts = text.split('.');
      if (parts[1] && parts[1].length > decimalPlaces) {
        return;
      }
    }

    if (validateNumber(text)) {
      setError('');
      onChangeText(text);
    } else {
      setError(
        `${strings.VALUE_MUST_BETWEEN} ${min} ${strings.AND} ${max}${
          !allowDecimals ? ` ${strings.AND_WHOLE_NUMBER}` : ''
        }`
      );
    }
  };

  const increment = () => {
    const currentValue = Number(value) || 0;
    const newValue = Math.min(currentValue + step, max);
    onChangeText(allowDecimals ? newValue.toFixed(decimalPlaces) : String(Math.floor(newValue)));
  };

  const decrement = () => {
    const currentValue = Number(value) || 0;
    const newValue = Math.max(currentValue - step, min);
    onChangeText(allowDecimals ? newValue.toFixed(decimalPlaces) : String(Math.floor(newValue)));
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        {showButtons && (
          <TouchableOpacity
            style={[styles.button, disabled || Number(value) <= min ? styles.buttonDisabled : null]}
            onPress={decrement}
            disabled={disabled || Number(value) <= min}
          >
            <Text
              style={[
                styles.buttonText,
                disabled || Number(value) <= min ? styles.buttonTextDisabled : null,
              ]}
            >
              <MinusIcon size={18}></MinusIcon>
            </Text>
          </TouchableOpacity>
        )}

        <TextInput
          label={label}
          value={String(value)}
          onChangeText={handleTextChange}
          keyboardType={allowDecimals ? 'decimal-pad' : 'numeric'}
          mode="outlined"
          style={[styles.input, showButtons && styles.inputWithButtons]}
          theme={{
            colors: {
              primary: colors.primary,
              placeholder: colors.grey,
              text: colors.white,
              background: colors.grey,
              surface: colors.grey,
              onSurface: colors.darkGrey,
              onSurfaceVariant: colors.lighterGrey,
              accent: colors.primary,
              onSecondaryContainer: colors.white,
            },
          }}
          outlineColor={error ? colors.veryLightRed : colors.lightGrey}
          activeOutlineColor={error ? colors.veryLightRed : colors.primary}
          textColor={colors.white}
          disabled={disabled}
          error={!!error}
          {...props}
        />

        {showButtons && (
          <TouchableOpacity
            style={[styles.button, disabled || Number(value) >= max ? styles.buttonDisabled : null]}
            onPress={increment}
            disabled={disabled || Number(value) >= max}
          >
            <Text
              style={[
                styles.buttonText,
                disabled || Number(value) >= max ? styles.buttonTextDisabled : null,
              ]}
            >
              <PlusIcon size={18}></PlusIcon>
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
  },
  inputWithButtons: {
    textAlign: 'center',
  },
  button: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.darkerGrey,
  },
  buttonText: {
    fontSize: 24,
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonTextDisabled: {
    color: colors.lightGrey,
  },
  errorText: {
    color: colors.veryLightRed,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default CustomNumberInput;
