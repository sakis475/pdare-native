import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import IoniconsIcons from 'react-native-vector-icons/Ionicons';

export function TableBox({ table, onPress }: any) {
  return (
    <TouchableOpacity key={table.id} style={styles.table} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.content}>
        <Text style={styles.tableName}>{table.tableName}</Text>
        <Text style={styles.elapsedTime}>95'</Text>
        <View style={[styles.personsCount, { flexDirection: 'row' }]}>
          <Text style={{ fontSize: 16, color: 'white' }}>x5</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  table: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#3058E9',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableName: {
    color: 'white',
    fontSize: 16,
  },
  elapsedTime: {
    position: 'absolute',
    top: 0,
    left: 0,
    color: 'white',
    fontSize: 14,
    backgroundColor: '#06090D',
    padding: 4,
    borderRadius: 4,
  },
  personsCount: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
});
