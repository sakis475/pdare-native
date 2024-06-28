import React from 'react';
import { BottomNavigation, Text } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TablesScreen from '../screens/TablesScreen';
import OrderScreen from '../screens/OrderScreen';
import LoginScreen from '../screens/LoginScreen';
import { setLocalizedStrings, strings } from '../core/strings';
import SingleOrderScreen from '../screens/SingleOrderScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../core/theme';
import ItemDetails from '../screens/ItemDetails';
import RestaurantSettingsScreen from '../screens/adminScreens/restaurantSettings';
import EditItemsScreen from '../screens/adminScreens/editItems';
import EditItemDetails from '../screens/adminScreens/editItemDetails';
import { EditItemsScreen2 } from '../screens/adminScreens/editItems2';
import NewOrderScreen from '../screens/orderScreens/newOrderScreen';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import TempOrderScreen from '../screens/orderScreens/tempOrderScreen';
import ItemListScreen from '../screens/orderScreens/ItemListScreen';
import ItemDetailsScreen from '../screens/orderScreens/ItemDetailsScreen';

const Stack = createNativeStackNavigator();

export const navigationRef = React.createRef<NavigationContainerRef<any>>();

export function navigate(name: ScreenNames, params?: {}) {
  if (navigationRef.current) {
    navigationRef.current.navigate(name, params);
  }
}

export function navigateBack() {
  if (navigationRef.current) {
    navigationRef.current.goBack();
  }
}

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerTitleAlign: 'center', orientation: 'portrait' }}>
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />

      <Stack.Screen
        name={ScreenNames.NewOrderScreen}
        component={NewOrderScreen}
        options={({ route }: any) => ({
          title: strings.Categories,
          presentation: 'modal',
          animation: 'slide_from_right',
          // title: route.params?.orderTitle || 'Order',
          headerStyle: {
            backgroundColor: colors.darkerGrey,
          },
          headerTintColor: 'white',
        })}
      />

      <Stack.Screen
        name={ScreenNames.ItemListScreen}
        component={ItemListScreen}
        options={({ route }: any) => ({
          title: strings.AddItems,
          presentation: 'modal',
          animation: 'none',
          // title: route.params?.orderTitle || 'Order',
          headerStyle: {
            backgroundColor: colors.darkerGrey,
          },
          headerTintColor: 'white',
        })}
      />

      <Stack.Screen
        name={ScreenNames.TempOrderScreen}
        component={TempOrderScreen}
        options={({ route }: any) => ({
          title: strings.DraftOrder,
          presentation: 'modal',
          animation: 'none',
          // title: route.params?.orderTitle || 'Order',
          headerStyle: {
            backgroundColor: colors.darkerGrey,
          },
          headerTintColor: 'white',
        })}
      />

      <Stack.Screen
        name="singleOrder"
        component={SingleOrderScreen}
        options={({ route }: any) => ({
          title: strings.NewOrder,
          presentation: 'modal',
          animation: 'slide_from_right',
          // title: route.params?.orderTitle || 'Order',
          headerStyle: {
            backgroundColor: colors.darkerGrey,
          },
          headerTintColor: 'white',
        })}
      />

      <Stack.Screen
        name={ScreenNames.ProfileScreen}
        component={ProfileScreen}
        options={{
          presentation: 'modal',
          animation: 'simple_push',
          headerStyle: {
            backgroundColor: colors.grey, // Change the header background color
          },
          headerTintColor: 'white', // Change the text color in the header
        }}
      />
      <Stack.Screen
        name="restaurantSettings"
        component={RestaurantSettingsScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_right',
          headerStyle: {
            backgroundColor: colors.grey, // Change the header background color
          },
          headerTintColor: 'white', // Change the text color in the header
        }}
      />
      <Stack.Screen
        name="editItems"
        component={EditItemsScreen2}
        options={{
          presentation: 'modal',
          animation: 'slide_from_right',
          headerStyle: {
            backgroundColor: colors.grey, // Change the header background color
          },
          headerTintColor: 'white', // Change the text color in the header
        }}
      />
      <Stack.Screen
        name={ScreenNames.ItemDetailsScreen}
        component={ItemDetailsScreen}
        options={({ route }: any) => ({
          presentation: 'modal',
          animation: 'fade_from_bottom',
          headerStyle: {
            backgroundColor: colors.grey, // Change the header background color
          },
          headerTintColor: 'white', // Change the text color in the header
          title: route.params?.item?.title || 'Λεπτομέριες',
        })}
      />
      <Stack.Screen
        name={'editItemDetails'}
        component={EditItemDetails}
        options={({ route }: any) => ({
          presentation: 'modal',
          animation: 'fade_from_bottom',
          headerStyle: {
            backgroundColor: colors.grey, // Change the header background color
          },
          headerTintColor: 'white', // Change the text color in the header
          title: route.params?.item?.title || 'Λεπτομέριες',
        })}
      />
    </Stack.Navigator>
  );
};

const MainTabs = () => {
  const [index, setIndex] = React.useState(0);

  const routes = [
    { key: strings.Tables, title: strings.Tables, focusedIcon: 'apps' },
    {
      key: strings.Draft,
      title: strings.Draft,
      focusedIcon: 'clipboard-outline',
    },
    { key: strings.Login, title: strings.Login, focusedIcon: 'heart-outline' },
  ];

  const renderScene = BottomNavigation.SceneMap({
    [strings.Tables]: TablesScreen,
    [strings.Draft]: TempOrderScreen,
    [strings.Login]: LoginScreen,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      barStyle={{ backgroundColor: colors.darkerGrey }}
      activeColor="#147eb8"
      inactiveColor="#FFFFFF"
    />
  );
};

export enum ScreenNames {
  NewOrderScreen = 'newOrderScreen',
  ItemListScreen = 'itemListScreen',
  TempOrderScreen = 'tempOrderScreen',
  ProfileScreen = 'profileScreen',
  ItemDetailsScreen = 'itemDetailsScreen',
}
export default AppNavigator;
