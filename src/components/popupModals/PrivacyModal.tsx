import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { Portal } from 'react-native-paper';
import { useStrings } from '../../core/localization/languageContext';
import BaseModal from '../basic/BaseModal';
import { colors } from '../../core/theme';

interface PrivacyModelProps {
  isModalVisible: boolean;
  onDismiss: () => void;
}

const PrivacyModel: React.FC<PrivacyModelProps> = ({ isModalVisible, onDismiss }) => {
  const strings = useStrings();

  return (
    <Portal>
      <BaseModal
        title={strings.PRIVACY_POLICY} // Localized title
        visible={isModalVisible}
        onClose={onDismiss}
        onConfirm={() => {}}
        theme={'dark'}
        buttonVariant={'okOnly'}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.policyText}>{strings.PRIVACY_POLICY_TEXT}</Text>
        </View>
      </BaseModal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: 'center',
  },
  policyText: {
    color: colors.white,
    flex: 1,
    marginLeft: 8,
    fontSize: 17,
  },
  button: {
    marginTop: 10,
  },
});

export default PrivacyModel;
