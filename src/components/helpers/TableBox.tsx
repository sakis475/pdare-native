import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import IoniconsIcons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../core/theme';

export function TableBox({ table, onPress }: any) {
  return (
    <TouchableOpacity key={table.id} style={styles.table} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.content}>
        <Text style={styles.tableName}>{table.tableName}</Text>
        <Text style={styles.elapsedTime}>95'</Text>
        <View style={[styles.personsCount, { flexDirection: 'row' }]}>
          <Text style={{ fontSize: 16, color: colors.white }}>x5</Text>
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
    backgroundColor: colors.blue,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableName: {
    color: colors.white,
    fontSize: 16,
  },
  elapsedTime: {
    position: 'absolute',
    top: 0,
    left: 0,
    color: colors.white,
    fontSize: 14,
    backgroundColor: colors.black,
    padding: 4,
    borderRadius: 4,
  },
  personsCount: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
});
