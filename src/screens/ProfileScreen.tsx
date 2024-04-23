import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Divider } from 'react-native-paper';

const ProfileOptionsScreen = ({ route }: any) => {
  const navigation = useNavigation();

  // List of profile options
  const options = [
    { id: '1', title: 'Edit Profile', onPress: () => handlePress('EditProfile') },
    { id: '2', title: 'Change Password', onPress: () => handlePress('ChangePassword') },
    { id: '3', title: 'Notifications', onPress: () => handlePress('Notifications') },
    { id: '4', title: 'Privacy Settings', onPress: () => handlePress('PrivacySettings') },
    { id: '5', title: 'Log Out', onPress: () => handlePress('Logout') },
    { id: '6', title: 'Restaurant Settings', onPress: () => handlePress('restaurantSettings') },
  ];

  // Handler for press events
  const handlePress = (screen: string) => {
    console.log(`Navigating to ${screen}`);
    //@ts-ignore
    navigation.navigate(screen);
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
    fontSize: 18,
  },
});

export default ProfileOptionsScreen;
