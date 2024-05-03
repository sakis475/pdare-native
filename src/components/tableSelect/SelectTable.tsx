import { useState } from 'react';
import { TextInput } from 'react-native-paper';
import { strings } from '../../core/strings';
import TableSelectHorizontalContainer from './TableSelectHorizontalContainer';
import { StyleSheet, View } from 'react-native';

export function SelectTable({ allTables, onTableSelect }: any) {
  const [text, setText] = useState('');
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput placeholder="Search" value={text} onChangeText={setText} style={styles.input} />
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
  },
  input: {
    fontSize: 10,
    // Additional styles for your TextInput if needed
  },
});
