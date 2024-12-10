import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import IoniconsIcons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../core/theme';
import { navigate, ScreenNames } from '../../navigation/navigationUtils';
import { UserIcon } from '../basic/Icons';

export function HeaderBar({ headerTitle }: { headerTitle?: string }) {
  return (
    <View style={styles.headerBarContainer}>
      <View>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
      </View>
      <View style={styles.profileButton}>
        <ProfileButton
          handlePress={() => navigate(ScreenNames.RestaurantSettingsScreen)}
        ></ProfileButton>
      </View>
    </View>
  );
}

function ProfileButton({ handlePress }: any) {
  return (
    <TouchableOpacity onPress={handlePress}>
      <Text style={{ color: colors.veryLighterGrey }}>
        <UserIcon></UserIcon>
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  headerBarContainer: {
    height: 60,
    backgroundColor: colors.darkerGrey,
    justifyContent: 'center',
  },
  profileButton: {
    position: 'absolute',
    right: 10,
  },
  headerTitle: {
    color: colors.veryLighterGrey,
    fontWeight: '700',
    fontSize: 20,
    alignSelf: 'center',
  },
});
