import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../core/theme';
import PrivacyModel from '../components/popupModals/PrivacyModal';
import CustomButton from '../components/basic/CustomButton';
import { useStrings } from '../core/localization/languageContext';

const APP_NAME = 'ServeTab';
const APP_VERSION = '1.0.0';
const CONTACT_EMAIL = 'info@servetab.app';

const AboutScreen = () => {
  const [policyDialogVisible, setPolicyDialogVisible] = useState(false);
  const strings = useStrings();
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.title}>{APP_NAME}</Text>
          <Text style={styles.text}>{strings.APP_DESCRIPTION_1}</Text>
          <Text style={styles.text}>{strings.APP_DESCRIPTION_2}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.text}>
            <Text style={styles.bold}>{strings.CONTACT_EMAIL}</Text> {CONTACT_EMAIL}
          </Text>
        </View>

        <View style={styles.section}>
          <CustomButton onPress={() => setPolicyDialogVisible(true)}>
            {strings.PRIVACY_POLICY}
          </CustomButton>
        </View>

        <PrivacyModel
          isModalVisible={policyDialogVisible}
          onDismiss={() => setPolicyDialogVisible(false)}
        />
      </ScrollView>

      <Text style={styles.appVersion}>
        {strings.VERSION} {APP_VERSION}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: colors.darkGrey,
  },
  section: {
    backgroundColor: colors.grey,
    marginVertical: 10,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.slightlyLighterGrey,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: colors.white,
    marginBottom: 8,
    textAlign: 'justify',
  },
  bullet: {
    fontSize: 16,
    color: colors.white,
    marginBottom: 4,
    textAlign: 'left',
  },
  bulletContainer: {
    marginBottom: 12,
  },
  bulletSubtitle: {
    fontSize: 14,
    color: colors.white,
    textAlign: 'left',
    marginLeft: 8,
  },
  bold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  appVersion: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    color: colors.veryLighterGrey,
  },
});

export default AboutScreen;
