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
  ...props
}) => {
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
        colors: {
          primary: colors.primary,
          placeholder: colors.grey,
          text: colors.white,
          background: colors.grey,
          surface: colors.grey,
          onSurface: colors.darkGrey,
          onSurfaceVariant: colors.lighterGrey,
          // Add these for focus state
          accent: colors.primary, // Color when focused
          onSecondaryContainer: colors.white, // Label color when focused
        },
      }}
      outlineColor={colors.lightGrey}
      activeOutlineColor={colors.primary} // Border color when focused
      textColor={colors.white}
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
