import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../core/theme';

interface TempBottomOptionsProps {
  tableName: string;
  handleOpenModal: () => void;
  handleTempOrderPress: () => void;
}

const TempBottomOptions: React.FC<TempBottomOptionsProps> = ({
  tableName,
  handleOpenModal,
  handleTempOrderPress,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.tempOrderButton]}
        onPress={handleTempOrderPress}
      >
        <Text style={styles.buttonText}>Προσθήκη</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.tableButton]} onPress={handleOpenModal}>
        <Text style={styles.buttonText}>{tableName}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 4,
    backgroundColor: colors.darkerGrey,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    borderRadius: 6,
    marginHorizontal: 20,
    height: 60,
    width: 60,
  },
  tempOrderButton: {
    flex: 2,
    backgroundColor: 'green',
  },
  tableButton: {
    backgroundColor: 'blue',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default TempBottomOptions;
