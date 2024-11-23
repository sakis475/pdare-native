import React from 'react';
import { Text, TouchableOpacity, FlatList, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenNames, navigate } from '../../navigation/AppNavigator';
import { colors } from '../../core/theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const RestaurantSettingsScreen = ({ route }: any) => {
  const options = [
    {
      id: '1',
      title: 'Προφίλ',
      icon: 'account',
      screen: ScreenNames.AdminProductsScreen,
    },
    {
      id: '2',
      title: 'Προϊόντα',
      icon: 'shape-outline',
      screen: ScreenNames.ManageCategoriesScreen,
    },
    {
      id: '3',
      title: 'Τραπέζια',
      icon: 'apps',
      screen: ScreenNames.ManageTableScreen,
    },
    {
      id: '4',
      title: 'Πρότυπα Ιδιοτήτων',
      icon: 'cards-variant',
      screen: ScreenNames.ManageItemDetailsPatternScreen,
    },
    {
      id: '5',
      title: 'Προσωπικό',
      icon: 'account-group',
      screen: ScreenNames.AdminProductsScreen,
    },
    {
      id: '6',
      title: 'Στατιστικά',
      icon: 'chart-bar',
      screen: ScreenNames.AdminProductsScreen,
    },
  ];

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.option}
      onPress={() => navigate(item.screen)}
      activeOpacity={0.7}
    >
      <Icon name={item.icon} size={30} color="#fff" />
      <Text style={styles.text}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={options}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.container}
      />
      <LogoutFAB></LogoutFAB>
    </View>
  );
};

const LogoutFAB: React.FC = () => {
  return (
    <TouchableOpacity style={styles.fabContainer}>
      <View style={styles.fab}>
        <MaterialIcons name="logout" size={24} color={colors.white} />
        <Text style={styles.fabText}>Logout</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#2F2F2F',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#2F2F2F',
  },
  option: {
    flex: 1,
    margin: 8,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#404040',
    borderRadius: 8,
    width: 100,
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
