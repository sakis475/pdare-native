import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { strings } from '../../core/strings';
import { sortNumberAndStrings } from '../../core/utils';

const boxSize = 80;

const TableSelectHorizontalContainer = ({ tables, searchWord, onTableSelect }: any) => {
  //TODO: pass search key, filter allTables by search key, sort by name
  const [allTables, setAllTables] = useState(
    tables.sort((a: any, b: any) => sortNumberAndStrings(a.text, b.text))
  );

  useEffect(() => {
    setAllTables(tables);
    filterTable(searchWord);
  }, [searchWord]);

  const handleTableSelect = (table: any) => {
    onTableSelect(table);
  };

  // Function to remove an item from allTables
  const filterTable = (searchWord: string) => {
    if (searchWord) {
      setAllTables((prevTables: any) => {
        return prevTables.filter((item: any) => item.text.includes(searchWord));
      });
    }
  };

  const TableBox = ({ item, newBox = false }: any) => {
    let customStyle = styles.box;
    if (newBox) {
      customStyle = { ...styles.box, backgroundColor: 'orange' };
    }
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => handleTableSelect(item.text)}>
        <View style={customStyle}>
          <Text style={styles.boxText}>{item.text}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const screenWidth = Dimensions.get('window').width;
  const numColumns = Math.ceil(allTables.length / 2);
  const contentWidth = (numColumns + 1) * boxSize; // Assuming each box has a width of 30 and margin of 5

  const flatList = (
    <FlatList
      key={`flatList${numColumns}`}
      numColumns={numColumns}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      data={allTables}
      renderItem={TableBox}
    />
  );

  if (allTables.length === 0 && searchWord) {
    return (
      <>
        <Text style={{ color: 'grey', marginLeft: 5 }}>{strings.TempTable}</Text>
        <TableBox item={{ text: searchWord }} newBox={true} />
      </>
    );
  }
  return contentWidth > screenWidth ? (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      directionalLockEnabled={true}
      alwaysBounceVertical={false}
    >
      {flatList}
    </ScrollView>
  ) : (
    flatList
  );
};

const styles = StyleSheet.create({
  box: {
    width: boxSize,
    height: boxSize,
    backgroundColor: 'blue',
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxText: {
    color: 'white',
    fontSize: 12,
  },

  newBox: {
    width: boxSize,
    height: boxSize,
    backgroundColor: 'orange',
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TableSelectHorizontalContainer;
