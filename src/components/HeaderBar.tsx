import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import IoniconsIcons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../core/theme';

export function HeaderBar({ headerTitle }: { headerTitle?: string }) {
  const navigation = useNavigation();

  return (
    <View style={styles.headerBarContainer}>
      <View>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
      </View>
      <View style={styles.profileButton}>
        <ProfileButton
          handlePress={() =>
            //@ts-ignore
            navigation.navigate('profile')
          }
        ></ProfileButton>
      </View>
    </View>
  );
}

function ProfileButton({ handlePress }: any) {
  return (
    <TouchableOpacity onPress={handlePress}>
      <Text style={{ color: '#e3e1e1' }}>
        <IoniconsIcons name="person-circle-outline" size={40}></IoniconsIcons>
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  headerBarContainer: {
    height: 50,
    backgroundColor: colors.darkerGrey,
    justifyContent: 'center',
  },
  profileButton: {
    position: 'absolute',
    right: 10,
  },
  headerTitle: {
    color: '#e3e1e1',
    fontWeight: '700',
    fontSize: 20,
    alignSelf: 'center',
  },
});
