import React, { useCallback, useEffect, useState } from 'react';
import { Text, TouchableOpacity, FlatList, StyleSheet, View, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../core/theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getStorage } from '../../storage/store';
import { ActivityIndicator } from 'react-native-paper';
import { logout } from '../../helpers/storage/tokenRequests';
import { navigate, ScreenNames } from '../../navigation/navigationUtils';

interface SettingOption {
  id: string;
  title: string;
  icon: string;
  screen: ScreenNames;
  allowedRoles: string[];
}

const settingsOptions = [
  {
    id: '1',
    title: 'Προφίλ',
    icon: 'account',
    screen: ScreenNames.AdminProductsScreen,
    allowedRoles: ['owner', 'waiter', 'guest'],
  },
  {
    id: '2',
    title: 'Προϊόντα',
    icon: 'shape-outline',
    screen: ScreenNames.ManageCategoriesScreen,
    allowedRoles: ['owner'],
  },
  {
    id: '3',
    title: 'Τραπέζια',
    icon: 'apps',
    screen: ScreenNames.ManageTableScreen,
    allowedRoles: ['owner'],
  },
  {
    id: '4',
    title: 'Πρότυπα Ιδιοτήτων',
    icon: 'cards-variant',
    screen: ScreenNames.ManageItemDetailsPatternScreen,
    allowedRoles: ['owner'],
  },
  {
    id: '5',
    title: 'Προσωπικό',
    icon: 'account-group',
    screen: ScreenNames.AdminProductsScreen,
    allowedRoles: ['owner'],
  },
  {
    id: '6',
    title: 'Στατιστικά',
    icon: 'chart-bar',
    screen: ScreenNames.AdminProductsScreen,
    allowedRoles: ['owner'],
  },
];
const RestaurantSettingsScreen = ({ route }: any) => {
  const [filteredOptions, setFilteredOptions] = useState<SettingOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserOptions = async () => {
      try {
        const user = (await getStorage('currentUser')) as User;
        const filter = user ? user.role : 'guest';
        const userOptions = settingsOptions.filter((option) =>
          option.allowedRoles.includes(filter)
        );
        setFilteredOptions(userOptions);
      } catch (error) {
        console.error('Error loading user options:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserOptions();
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: SettingOption }) => (
      <TouchableOpacity
        style={styles.option}
        onPress={() => navigate(item.screen)}
        activeOpacity={0.7}
      >
        <Icon name={item.icon} size={30} color="#fff" />
        <Text style={styles.text}>{item.title}</Text>
      </TouchableOpacity>
    ),
    []
  );

  if (isLoading) {
    return (
      <View style={[styles.mainContainer, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={filteredOptions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.container}
      />
      <LogoutFAB />
    </View>
  );
};

const LogoutFAB: React.FC = () => {
  return (
    <TouchableOpacity style={styles.fabContainer} onPress={logout}>
      <View style={styles.fab}>
        <MaterialIcons name="logout" size={24} color={colors.white} />
        <Text style={styles.fabText}>Logout</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#2F2F2F',
  },
  container: {
    padding: 16,
    backgroundColor: '#2F2F2F',
  },
  option: {
    margin: 8,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#404040',
    borderRadius: 8,
    width: (Dimensions.get('window').width - 32 - 32) / 2, // (screen width - container padding - item margins) / 2
    height: 100,
  },
  text: {
    marginTop: 8,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  fab: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.slightlyDarkerGrey,
    borderColor: colors.slightlyLighterGrey,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  fabText: {
    color: colors.white,
    fontSize: 12,
    marginTop: 2,
  },
});

export default RestaurantSettingsScreen;
