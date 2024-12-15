import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../core/theme';
import { useStrings } from '../../core/localization/languageContext';

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
  //TODO: pass search key, filter allTables by search key, sort by name
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
      setAllTables((prevTables: Table[]) => {
        const tablesExist = tables.filter((table) => table.tableName.includes(searchWord));
        return tablesExist;
      });
    } else {
      setAllTables(tables);
    }
  };

  const TableBox = ({ table, newBox }: { table: Table; newBox: boolean }) => {
    let customStyle = styles.box;
    if (newBox) {
      customStyle = { ...styles.box, backgroundColor: colors.orange };
    }
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => handleTableSelect(table)}>
        <View style={customStyle}>
          <Text style={styles.boxText}>{table.tableName}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const screenWidth = Dimensions.get('window').width;
  const numColumns = allTables?.length > 0 ? Math.ceil(allTables.length / 2) : 0;
  const contentWidth = (numColumns + 1) * boxSize;

  return (
    <View style={styles.container}>
      {searchWord?.length && allTables.length === 0 ? (
        <View>
          <Text style={styles.boxText}>{strings.NO_TABLE_FOUND_CREATE_NEW}</Text>
          <TableBox
            table={{ id: -1, isEnabled: false, tableOrder: -1, tableName: searchWord }}
            newBox={true}
          ></TableBox>
        </View>
      ) : allTables.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.noTablesText}>{strings.NO_TABLE_AVAILABLE}</Text>
        </View>
      ) : allTables?.length ? (
        contentWidth > screenWidth ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            directionalLockEnabled={true}
            alwaysBounceVertical={false}
          >
            <FlatList
              key={`flatList${numColumns}`}
              numColumns={numColumns}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              data={allTables}
              renderItem={({ item }) => <TableBox table={item} newBox={false} />}
            />
          </ScrollView>
        ) : (
          <FlatList
            key={`flatList${numColumns}`}
            numColumns={numColumns}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            data={allTables}
            renderItem={({ item }) => <TableBox table={item} newBox={false} />}
          />
        )
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
    minHeight: boxSize, // Match the height of a table box
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  newBox: {
    width: boxSize,
    height: boxSize,
    backgroundColor: colors.orange,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TableSelectHorizontalContainer;
