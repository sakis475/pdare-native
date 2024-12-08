import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, View, Dimensions } from 'react-native';
import { colors } from '../../core/theme';
import dayjs, { datetimeDiff } from '../../core/dayjs';
import FeatherIcons from 'react-native-vector-icons/FontAwesome5';

// Dynamic size calculations
const GRID_SIZE = 4; // Number of columns
const MARGIN = 8; // Space between boxes
const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Calculate box size: (screen width - padding on both sides - total margin space between boxes) / number of columns
const BOX_SIZE = Math.floor((SCREEN_WIDTH - MARGIN * 2 - MARGIN * (GRID_SIZE - 1)) / GRID_SIZE);

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
    calculateElapsedTime();
    const interval = setInterval(calculateElapsedTime, 60000);
    return () => clearInterval(interval);
  }, [table.occupiedByOrder?.createdAt]);

  return (
    <TouchableOpacity
      key={table.id}
      style={styles.table}
      activeOpacity={0.7}
      onPress={() => onPress(table)}
    >
      <View style={styles.content}>
        <Text style={[styles.tableName, { fontSize: BOX_SIZE * 0.18 }]}>{table.tableName}</Text>
        {elapsedTime ? (
          <Text style={[styles.elapsedTime, { fontSize: BOX_SIZE * 0.14 }]}>{elapsedTime}</Text>
        ) : null}
        {elapsedTime ? (
          <View style={styles.personsCount}>
            <View style={styles.personsCountContent}>
              <FeatherIcons name="users" size={BOX_SIZE * 0.14} color={colors.veryLighterGrey} />
              <Text style={styles.personsCountText}>{table?.occupiedByOrder?.couvert || 0}</Text>
            </View>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  table: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 8,
    backgroundColor: colors.blue,
    paddingVertical: MARGIN / 2,
    paddingHorizontal: MARGIN / 2,
    margin: MARGIN / 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableName: {
    color: colors.white,
  },
  elapsedTime: {
    position: 'absolute',
    top: 0,
    left: 0,
    color: colors.white,
    backgroundColor: colors.black,
    padding: MARGIN / 2,
    borderRadius: 4,
  },
  personsCount: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.darkBlue,
    borderRadius: 4,
    padding: 4,
    minWidth: BOX_SIZE * 0.3, // Ensure minimum width for content
  },
  personsCountContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4, // Consistent gap between icon and number
  },
  personsCountText: {
    fontSize: BOX_SIZE * 0.14,
    color: colors.white,
    textAlignVertical: 'center',
    includeFontPadding: false, // Removes extra padding around text
    marginTop: 1, // Fine-tune vertical alignment
  },
});

// You'll need to wrap these boxes in a container with this style:
export const containerStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    padding: MARGIN / 2,
  },
});
