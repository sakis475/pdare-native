import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { colors } from '../../core/theme';
import dayjs, { datetimeDiff } from '../../core/dayjs';
import FeatherIcons from 'react-native-vector-icons/FontAwesome5';

export function TableBox({ table, onPress }: { table: Table; onPress: any }) {
  const [elapsedTime, setElapsedTime] = useState('');

  const calculateElapsedTime = () => {
    if (table.occupiedByOrder?.createdAt) {
      const minutesPassed = datetimeDiff(
        dayjs.utc(),
        dayjs(table.occupiedByOrder.createdAt),
        'minutes'
      );

      if (minutesPassed > 240) {
        setElapsedTime("240' +");
      } else {
        setElapsedTime(`${minutesPassed}'`);
      }
    } else {
      setElapsedTime('');
    }
  };

  useEffect(() => {
    // Initial calculation
    calculateElapsedTime();

    // Update elapsed time every minute
    const interval = setInterval(calculateElapsedTime, 60000); // Update every minute

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [table.occupiedByOrder?.createdAt]); // Recalculate if createdAt changes

  return (
    <TouchableOpacity
      key={table.id}
      style={styles.table}
      activeOpacity={0.7}
      onPress={() => onPress(table)}
    >
      <View style={styles.content}>
        <Text style={styles.tableName}>{table.tableName}</Text>
        {elapsedTime ? <Text style={styles.elapsedTime}>{elapsedTime}</Text> : null}
        {elapsedTime ? (
          <View style={[styles.personsCount, { flexDirection: 'row' }]}>
            <FeatherIcons name="users" size={13} color={colors.veryLighterGrey}></FeatherIcons>
            <Text style={{ fontSize: 13, color: colors.white }}>
              {table.occupiedByOrder.couvert}
            </Text>
          </View>
        ) : null}
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
    backgroundColor: colors.darkBlue,
    borderRadius: 4,
    paddingVertical: 1,
    paddingHorizontal: 4,
    position: 'absolute',
    top: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
});
