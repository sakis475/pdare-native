import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../core/theme';
import { useStrings } from '../../core/localization/languageContext';
import { Table } from '../../types/basic.types';

const boxSize = 80;

const TableSelectHorizontalContainer = ({
  tables,
  searchWord,
  onTableSelect,
}: {
  tables: Table[];
  searchWord: string;
  onTableSelect: any;
}) => {
  const [allTables, setAllTables] = useState<Table[]>(tables?.length ? tables : []);
  const strings = useStrings();

  useEffect(() => {
    filterTable(searchWord);
  }, [searchWord]);

  useEffect(() => {
    setAllTables(tables ?? []);
  }, [tables]);

  const handleTableSelect = (table: Table) => {
    onTableSelect(table);
  };

  const filterTable = (searchWord: string) => {
    if (searchWord) {
      const filtered = tables.filter((table) =>
        table.tableName.toLowerCase().includes(searchWord.toLowerCase())
      );
      setAllTables(filtered);
    } else {
      setAllTables(tables);
    }
  };

  const TableBox = ({ table, newBox }: { table: Table; newBox: boolean }) => {
    const customStyle = newBox ? { ...styles.box, backgroundColor: colors.orange } : styles.box;

    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => handleTableSelect(table)}>
        <View style={customStyle}>
          <Text style={styles.boxText}>{table.tableName}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (searchWord?.length && allTables.length === 0) {
      return (
        <View>
          <Text style={styles.boxText}>{strings.NO_TABLE_FOUND_CREATE_NEW}</Text>
          <TableBox
            table={{ id: -1, isEnabled: false, tableOrder: -1, tableName: searchWord }}
            newBox={true}
          />
        </View>
      );
    }

    if (allTables.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.noTablesText}>{strings.NO_TABLE_AVAILABLE}</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={allTables}
        key={'flatList-vertical'}
        numColumns={4} // You can adjust this number
        showsVerticalScrollIndicator={true}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <TableBox table={item} newBox={false} />}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <View style={styles.container}>
      {allTables ? (
        renderContent()
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    flex: 1,
  },
  listContent: {
    paddingBottom: 10,
    // alignItems: 'center',
  },
  box: {
    width: boxSize,
    height: boxSize,
    backgroundColor: colors.blue,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxText: {
    color: colors.white,
    fontSize: 12,
    textAlign: 'center',
  },
  noTablesText: {
    color: colors.white,
    fontSize: 12,
    textAlign: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: boxSize,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

export default TableSelectHorizontalContainer;
