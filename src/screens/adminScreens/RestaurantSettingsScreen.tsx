import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, TouchableOpacity, FlatList, StyleSheet, View, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../core/theme';
import { getStorage } from '../../storage/store';
import { ActivityIndicator } from 'react-native-paper';
import { navigate, ScreenNames } from '../../navigation/navigationUtils';
import { useStrings } from '../../core/localization/languageContext';
import { LogoutFAB } from '../../components/LogoutFab';

interface SettingOption {
  id: string;
  title: string;
  icon: string;
  screen: ScreenNames;
  allowedRoles: string[];
}

const RestaurantSettingsScreen = ({ route }: any) => {
  const [filteredOptions, setFilteredOptions] = useState<SettingOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const strings = useStrings();
  const settingsOptions = useMemo(
    () => [
      {
        id: '0',
        title: strings.PROFILE,
        icon: 'account',
        screen: ScreenNames.ProfileScreen,
        allowedRoles: ['owner', 'waiter', 'guest'],
      },
      {
        id: '1',
        title: strings.ORDER_HISTORY,
        icon: 'history',
        screen: ScreenNames.HistoryOrdersScreen,
        allowedRoles: ['owner', 'waiter'],
      },
      {
        id: '2',
        title: strings.PRODUCTS,
        icon: 'shape-outline',
        screen: ScreenNames.ManageCategoriesScreen,
        allowedRoles: ['owner'],
      },
      {
        id: '3',
        title: strings.TABLES,
        icon: 'apps',
        screen: ScreenNames.ManageTableScreen,
        allowedRoles: ['owner'],
      },
      {
        id: '4',
        title: strings.PROPERTY_TEMPLATES,
        icon: 'cards-variant',
        screen: ScreenNames.ManageItemDetailsPatternScreen,
        allowedRoles: ['owner'],
      },
      {
        id: '5',
        title: strings.STAFF,
        icon: 'account-group',
        screen: ScreenNames.AdminPersonelScreen,
        allowedRoles: ['owner'],
      },
      {
        id: '6',
        title: strings.PRINTERS,
        icon: 'printer',
        screen: ScreenNames.ManagePrintersScreen,
        allowedRoles: ['owner'],
      },
    ],
    [strings]
  );
  useEffect(() => {
    const loadUserOptions = async () => {
      try {
        const user = await getStorage('currentUser');
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
  }, [settingsOptions]);

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
});

export default RestaurantSettingsScreen;
