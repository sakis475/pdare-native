import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Portal, RadioButton } from 'react-native-paper';
import { colors } from '../../core/theme';
import { useStrings } from '../../core/localization/languageContext';
import BaseModal from '../basic/BaseModal';
import { AppLanguage } from '../../core/localization/strings';

interface LanguageSelectorModalProps {
  isModalVisible: boolean;
  selectedLanguage: string;
  onDismiss: () => void;
  onLanguageChange: (language: AppLanguage) => void;
}

export const languageOptions = [
  { id: 1, value: 'lang_en', label: 'English' },
  { id: 2, value: 'lang_el', label: 'Ελληνικά' },
];

const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isModalVisible,
  selectedLanguage,
  onDismiss,
  onLanguageChange,
}) => {
  const strings = useStrings();

  return (
    <Portal>
      <BaseModal
        title={strings.LANGUAGE_SETTINGS}
        visible={isModalVisible}
        onClose={onDismiss}
        onConfirm={onDismiss}
        theme="dark"
        buttonVariant="okOnly"
      >
        <View style={styles.container}>
          {languageOptions.map((option) => (
            <View key={option.id} style={styles.languageOption}>
              <RadioButton.Android
                value={option.value}
                status={selectedLanguage === option.value ? 'checked' : 'unchecked'}
                color={colors.primary}
                uncheckedColor={colors.white}
                onPress={() => onLanguageChange(option.value as AppLanguage)}
              />
              <Text style={styles.languageLabel}>{option.label}</Text>
            </View>
          ))}
        </View>
      </BaseModal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageLabel: {
    color: colors.white,
    fontSize: 16,
  },
});

export default LanguageSelectorModal;
