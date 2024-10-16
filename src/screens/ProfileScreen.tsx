import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Divider } from 'react-native-paper';
import { ScreenNames, navigate } from '../navigation/AppNavigator';
import { colors } from '../core/theme';
import { removeAllStorage } from '../storage/store';

const ProfileOptionsScreen = ({ route }: any) => {
  const navigation = useNavigation();

  // List of profile options
  const options = [
    {
      id: '1',
      title: 'Restaurant Settings',
      onPress: () => handlePress(ScreenNames.RestaurantSettingsScreen),
    },
    {
      id: '2',
      title: 'Account Delete',
      onPress: () => {},
    },
    {
      id: '6',
      title: 'Clear Storage',
      onPress: () => removeAllStorage(),
    },
  ];

  // Handler for press events
  const handlePress = (screen: ScreenNames) => {
    navigate(screen);
  };

  return (
    <ScrollView style={styles.container}>
      {options.map((option, index) => (
        <View key={option.id}>
          <TouchableOpacity style={styles.option} onPress={option.onPress}>
            <Text style={styles.text}>{option.title}</Text>
          </TouchableOpacity>
          {index !== options.length - 1 && <Divider />}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#2F2F2F',
  },
  option: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  text: {
    color: colors.white,
    fontSize: 18,
  },
});

export default ProfileOptionsScreen;
