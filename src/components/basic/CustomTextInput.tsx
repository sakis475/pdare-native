import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { colors } from '../../core/theme';

interface CustomTextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: any;
  disabled?: boolean;
  mode?: 'outlined' | 'flat';
  theme?: 'light' | 'dark';
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  style,
  disabled = false,
  mode = 'outlined',
  theme = 'dark',
  ...props
}) => {
  const getThemeColors = () => {
    return theme === 'light'
      ? {
          primary: colors.grey,
          placeholder: colors.grey,
          text: colors.grey,
          background: colors.white,
          surface: colors.white,
          onSurface: colors.grey,
          onSurfaceVariant: colors.grey,
          accent: colors.grey,
          onSecondaryContainer: colors.grey,
        }
      : {
          primary: colors.primary,
          placeholder: colors.grey,
          text: colors.white,
          background: colors.grey,
          surface: colors.grey,
          onSurface: colors.darkGrey,
          onSurfaceVariant: colors.lighterGrey,
          accent: colors.primary,
          onSecondaryContainer: colors.white,
        };
  };

  return (
    <TextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      mode="outlined"
      style={[styles.input, style]}
      theme={{
        colors: getThemeColors(),
      }}
      outlineColor={theme === 'light' ? colors.grey : colors.lightGrey}
      activeOutlineColor={theme === 'light' ? colors.grey : colors.primary}
      textColor={theme === 'light' ? colors.grey : colors.white}
      disabled={disabled}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 12,
  },
});

export default CustomTextInput;
