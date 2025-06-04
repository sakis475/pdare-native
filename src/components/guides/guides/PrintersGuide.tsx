import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../../../core/theme';
import { useStrings } from '../../../core/localization/languageContext';
import { WINDOWS_PRINTER_APP_DOWNLOAD_URL } from '../../../storage/env';

const PrinterGuide = () => {
  const strings = useStrings();

  return (
    <ScrollView style={styles.noAppContainer} bounces={false} persistentScrollbar={true}>
      <View style={styles.noAppInstructionsContainer}>
        <Text style={styles.title}>
          <Text style={styles.keyword}>{strings.NETWORK}</Text>
        </Text>
        <Text style={styles.noAppText}>{strings.NETWORK_CONNECTION_PRIMARY}</Text>
        <Text style={styles.noAppStep}>{strings.CONNECT_ALL_PHONES_TO_ROUTER}</Text>
        <Text style={styles.noAppIndent}>• {strings.ENSURE_THERMAL_SAME_NETWORK}</Text>
        <Text style={styles.noAppIndent}>• {strings.THERMAL_PRINTER_CONNECTED}</Text>
        <Text style={styles.noAppIndent}>• {strings.UNIQUE_IP_ADRESS_SETTING}</Text>
      </View>

      <View style={styles.noAppInstructionsContainer}>
        <Text style={styles.title}>
          <Text style={styles.keyword}>{strings.PRINT_SERVER}</Text>
        </Text>
        <Text style={styles.noAppText}>{strings.ALTERNATIVE_COMPUTER_OPTION}</Text>
        <Text style={styles.noAppStep}>1. {strings.CONNECT_PRINTER_TO_ROUTER}</Text>
        <Text style={styles.noAppIndent}>• {strings.ENSURE_SAME_NETWORK}</Text>
        <Text style={styles.noAppIndent}>• {strings.INTERNET_REQUIRED}</Text>
        <Text style={styles.noAppIndent}>• {strings.ENSURE_THERMAL_SAME_NETWORK}</Text>

        <Text style={styles.noAppStep}>2. {strings.DOWNLOAD_START_APP}</Text>
        <Text style={styles.noAppIndent}>• Windows 10/11: {WINDOWS_PRINTER_APP_DOWNLOAD_URL}</Text>
        {/* <Text style={styles.noAppIndent}>• Linux: {LINUX_PRINTER_APP_DOWNLOAD_URL}</Text> */}

        <Text style={styles.noAppStep}>3. {strings.LOGIN_TO_APP}</Text>
        <Text style={styles.noAppStep}>4. {strings.PRESS_SEARCH_BUTTON}</Text>
        <Text style={styles.noAppStep}>5. {strings.KEEP_APP_RUNNING}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  noAppContainer: {
    flex: 1,
  },
  noAppTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
  },
  noAppInstructionsContainer: {
    width: '100%',
    backgroundColor: colors.darkGrey,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  noAppText: {
    fontSize: 14,
    color: colors.white,
    marginBottom: 24,
    lineHeight: 24,
  },
  noAppStep: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 12,
  },
  noAppIndent: {
    fontSize: 12,
    color: colors.white,
    marginLeft: 16,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.blue,
    marginBottom: 8,
  },
  keyword: {
    fontWeight: 'bold',
    color: colors.blue,
  },
});

export default PrinterGuide;
