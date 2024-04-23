import { useState } from 'react';
import { TextInput } from 'react-native-paper';
import { strings } from '../../core/strings';
import TableSelectHorizontalContainer from './TableSelectHorizontalContainer';

export function SelectTable({ allTables, onTableSelect }: any) {
  const [text, setText] = useState('');
  return (
    <>
      <TextInput
        mode={'flat'}
        label={strings.Search}
        value={text}
        onChangeText={(text) => setText(text)}
        style={{ fontSize: 10 }}
        // autoFocus={true}
        // ref={textInputRef}
      />
      <TableSelectHorizontalContainer
        tables={allTables}
        searchWord={text}
        onTableSelect={(selectedTable: any) => {
          onTableSelect(selectedTable);
        }}
      ></TableSelectHorizontalContainer>
    </>
  );
}
