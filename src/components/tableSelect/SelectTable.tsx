import { useState } from 'react';
import { TextInput } from 'react-native-paper';
import { strings } from '../../core/strings';
import TableSelectHorizontalContainer from './TableSelectHorizontalContainer';
import { View } from 'react-native';

export function SelectTable({ allTables, onTableSelect }: any) {
  const [text, setText] = useState('');
  return (
    <View>
      <TextInput
        mode={'flat'}
        label={strings.Search}
        value={text}
        onChangeText={(text) => setText(text)}
        style={{ fontSize: 10 }}
        // autoFocus={true}
        // ref={textInputRef}
      />
      <View>
        <TableSelectHorizontalContainer
          tables={allTables}
          searchWord={text}
          onTableSelect={(selectedTable: any) => {
            onTableSelect(selectedTable);
          }}
        ></TableSelectHorizontalContainer>
      </View>
    </View>
  );
}
