import { useState } from 'react';
import { TextInput } from 'react-native-paper';
import TableSelectHorizontalContainer from './TableSelectHorizontalContainer';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../core/theme';

export function SelectTable({ allTables, onTableSelect }: any) {
  const [text, setText] = useState('');
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Search/New Table"
          placeholderTextColor="#fff"
          textColor="#fff"
          value={text}
          onChangeText={setText}
          style={styles.input}
        />
      </View>
      <View style={styles.tableContainer}>
        <TableSelectHorizontalContainer
          tables={allTables}
          searchWord={text}
          onTableSelect={onTableSelect}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // This makes the container use all available space
  },
  inputContainer: {
    // This container does not need flex since we want the TextInput to determine its size
  },
  tableContainer: {
    flex: 1, // This makes the container expand to fill all remaining space
    color: 'white',
  },
  input: {
    fontSize: 10,
    backgroundColor: colors.lightGrey,
    borderRadius: 0,
    // Additional styles for your TextInput if needed
  },
});
