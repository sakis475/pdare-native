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

  useEffect(() => {
    filterTable(searchWord);
  }, [searchWord]);

  useEffect(() => {
    setAllTables(tables ?? []);
  }, [tables]);

  const handleTableSelect = (table: Table) => {
    onTableSelect(table);
  };

  // Function to remove an item from allTables
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
  const contentWidth = (numColumns + 1) * boxSize; // Assuming each box has a width of 30 and margin of 5

  return (
    <View style={{ marginTop: 5 }}>
      {searchWord?.length && allTables.length === 0 ? (
        <View>
          <Text style={styles.boxText}>
            Δεν βρέθηκε τραπέζι με αυτό το όνομα, δημιουργία καινούργιου.
          </Text>
          <TableBox
            table={{ id: -1, isEnabled: false, tableOrder: -1, tableName: searchWord }}
            newBox={true}
          ></TableBox>
        </View>
      ) : allTables.length === 0 ? (
        <Text style={styles.boxText}>Δεν βρέθηκε διαθέσιμο τραπέζι.</Text>
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
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
