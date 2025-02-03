import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../../../core/theme';
import { useStrings } from '../../../core/localization/languageContext';

const PatternGuide = () => {
  const strings = useStrings();

  return (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateTitle}>{strings.NO_PATTERNS_YET}</Text>
      <Text style={styles.emptyStateDescription}>{strings.PATTERNS_DESCRIPTION}</Text>
      <View style={styles.examplesContainer}>
        <Text style={styles.exampleTitle}>{strings.PATTERN_EXAMPLES}</Text>
        <View style={styles.example}>
          <Text style={styles.exampleHeading}>{strings.COFFEE_PATTERN}:</Text>
          <Text style={styles.exampleText}>• {strings.COFFEE_TYPE}</Text>
          <Text style={styles.exampleText}>• {strings.COFFEE_BEANS}</Text>
        </View>
        <View style={styles.example}>
          <Text style={styles.exampleHeading}>{strings.PIZZA_PATTERN}:</Text>
          <Text style={styles.exampleText}>• {strings.PIZZA_CRUST}</Text>
          <Text style={styles.exampleText}>• {strings.PIZZA_CHEESE}</Text>
          <Text style={styles.exampleText}>• {strings.PIZZA_TOPPINGS}</Text>
        </View>
      </View>
      <Text style={styles.instructionText}>{strings.TAP_PLUS_TO_CREATE_PATTERN}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyStateContainer: {
    flex: 1,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: colors.white,
    marginBottom: 24,
    lineHeight: 24,
  },
  examplesContainer: {
    width: '100%',
    backgroundColor: colors.darkGrey,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 16,
  },
  example: {
    marginBottom: 16,
  },
  exampleHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 12,
    color: colors.white,
    marginLeft: 16,
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    color: colors.white,
    fontStyle: 'italic',
  },
});

export default PatternGuide;
