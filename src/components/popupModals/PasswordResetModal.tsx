import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Portal } from 'react-native-paper';
import { useStrings } from '../../core/localization/languageContext';
import BaseModal from '../basic/BaseModal';
import { colors } from '../../core/theme';

interface PasswordResetModalProps {
  isModalVisible: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  isModalVisible,
  onDismiss,
  onConfirm,
}) => {
  const strings = useStrings();

  return (
    <Portal>
      <BaseModal
        title={strings.RESET_PASSWORD}
        visible={isModalVisible}
        onClose={onDismiss}
        onConfirm={onConfirm}
        theme="dark"
        buttonSaveText={strings.RESET}
      >
        <View style={styles.container}>
          <Text style={{ color: colors.white, textAlign: 'center' }}>
            {strings.RESET_PASSWORD_MESSAGE}
          </Text>
        </View>
      </BaseModal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
    justifyContent: 'center',
  },
});

export default PasswordResetModal;
