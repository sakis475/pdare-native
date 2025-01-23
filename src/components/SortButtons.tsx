import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ChevronDownIcon, ChevronUpIcon } from './basic/Icons';

export function SortButtons({ handleSort, disableUp, disableDown }: any) {
  return (
    <View style={styles.buttonsContainer}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleSort('sortUp')}
        activeOpacity={0.6}
        disabled={disableUp}
      >
        <ChevronUpIcon></ChevronUpIcon>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleSort('sortDown')}
        activeOpacity={0.6}
        disabled={disableDown}
      >
        <ChevronDownIcon></ChevronDownIcon>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333', // Dark background for the container
    borderRadius: 5, // Rounded corners for the container
    padding: 4,
  },
  button: {
    width: 40, // Width of the button
    height: 40, // Height of the button
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#555', // Slightly lighter color for buttons
    borderRadius: 6, // Rounded corners for the buttons
    marginHorizontal: 4, // Space between buttons
  },
});
