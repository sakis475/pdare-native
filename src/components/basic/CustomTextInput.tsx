import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { TouchableOpacity } from 'react-native';
import { colors } from '../../core/theme';
import { EyeOff, EyeOn } from './Icons';

interface CustomTextInputProps {
  label?: string;
  value: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  textContentType?: 'emailAddress' | 'none';
  maxLength?: number;
  error?: boolean;
  style?: any;
  disabled?: boolean;
  mode?: 'outlined' | 'flat';
  theme?: 'light' | 'dark';
  onFocus?: () => void;
  autoFocus?: boolean;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  label = '',
  value,
  placeholder,
  onChangeText,
  onBlur,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  textContentType = 'none',
  maxLength = 999,
  error = false,
  style,
  disabled = false,
  mode = 'outlined',
  theme = 'dark',
  onFocus,
  autoFocus = false,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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
    <View style={styles.container}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        textContentType={textContentType}
        mode={mode}
        style={[styles.input, style]}
        theme={{
          colors: getThemeColors(),
        }}
        outlineColor={theme === 'light' ? colors.grey : colors.lighterGrey}
        activeOutlineColor={theme === 'light' ? colors.grey : colors.white}
        textColor={theme === 'light' ? colors.grey : colors.white}
        placeholderTextColor={theme === 'light' ? colors.grey : colors.white}
        disabled={disabled}
        placeholder={placeholder}
        onBlur={onBlur}
        maxLength={maxLength}
        error={error}
        right={
          secureTextEntry ? (
            <TextInput.Icon
              icon={() => (
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={styles.eyeIcon}
                >
                  {isPasswordVisible ? (
                    <EyeOff size={24} color={theme === 'light' ? colors.grey : colors.white} />
                  ) : (
                    <EyeOn size={24} color={theme === 'light' ? colors.grey : colors.white} />
                  )}
                </TouchableOpacity>
              )}
            />
          ) : null
        }
        onFocus={onFocus}
        autoFocus={autoFocus}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    marginBottom: 12,
  },
  eyeIcon: {
    padding: 4,
  },
});

export default CustomTextInput;
