import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenNames, navigate } from '../../navigation/AppNavigator';

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
      title: 'Πρότυπα Ιδιοτήτων',
      icon: 'cards-variant',
      screen: ScreenNames.ManageItemDetailsPatternScreen,
    },
    {
      id: '4',
      title: 'Προσωπικό',
      icon: 'account-group',
      screen: ScreenNames.AdminProductsScreen,
    },
    {
      id: '5',
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
    <FlatList
      data={options}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
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
});

export default RestaurantSettingsScreen;
