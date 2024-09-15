import React, { useEffect, useState } from 'react';
import { BottomNavigation, Text } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TablesScreen from '../screens/TablesScreen';
import LoginScreen from '../screens/authenticationScreens/LoginScreen';
import { strings } from '../core/strings';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../core/theme';
import RestaurantSettingsScreen from '../screens/adminScreens/RestaurantSettingsScreen';
import NewOrderScreen from '../screens/orderScreens/newOrderScreen';
import { NavigationContainerRef } from '@react-navigation/native';
import TempOrderScreen from '../screens/orderScreens/tempOrderScreen';
import ItemListScreen from '../screens/orderScreens/ItemListScreen';
import ItemDetailsScreen from '../screens/orderScreens/ItemDetailsScreen';
import ManageProductsScreen from '../screens/adminScreens/ManageProductsScreen';
import Tooltip from 'rn-tooltip';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomNavigationScreenHeaderTitle from '../components/basic/CustomNavigationScreenHeaderTitle';
import RegisterScreen from '../screens/authenticationScreens/RegisterScreen';
import StartLoadingScreen from '../screens/StartLoadingScreen';
const Stack = createNativeStackNavigator();

export const navigationRef = React.createRef<NavigationContainerRef<any>>();

export function navigate(name: ScreenNames, params?: {}) {
  if (name === ScreenNames.LoginScreen) {
    navigateReset(ScreenNames.LoginScreen);
  }

  if (navigationRef.current) {
    navigationRef.current.navigate(name, params);
  }
}

export function navigateReset(initialScreen: ScreenNames) {
  if (navigationRef.current) {
    navigationRef.current.reset({
      index: 0,
      routes: [{ name: initialScreen }],
    });
  }
}

export function navigateBack() {
  if (navigationRef.current) {
    navigationRef.current.goBack();
  }
}

export function navigateToDraft() {
  if (navigationRef.current) {
    navigationRef.current.navigate('MainTabs', {
      screenIndex: 1,
    });
  }
}

export function navigateToTables() {
  if (navigationRef.current) {
    navigationRef.current.navigate('MainTabs', {
      screenIndex: 0,
    });
  }
}

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerTitleAlign: 'center', orientation: 'portrait' }}>
      <Stack.Screen
        name={ScreenNames.StartLoadingScreen}
        component={StartLoadingScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />

      <Stack.Screen
        name={ScreenNames.LoginScreen}
        component={LoginScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name={ScreenNames.RegisterScreen}
        component={RegisterScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name={ScreenNames.NewOrderScreen}
        component={NewOrderScreen}
        options={({ route }: any) => ({
          title: strings.Categories,
          animation: 'slide_from_right',
          headerStyle: {
            backgroundColor: colors.darkerGrey,
          },
          headerTintColor: 'white',
          headerLeft: navigateBackBtn,
          headerBackVisible: false,
        })}
      />

      <Stack.Screen
        name={ScreenNames.ItemListScreen}
        component={ItemListScreen}
        options={({ route }: any) => ({
          title: strings.AddItems,
          animation: 'none',
          headerStyle: {
            backgroundColor: colors.darkerGrey,
          },
          headerTintColor: 'white',
          headerLeft: navigateBackBtn,
          headerBackVisible: false,
        })}
      />

      <Stack.Screen
        name={ScreenNames.TempOrderScreen}
        component={TempOrderScreen}
        options={({ route }: any) => ({
          title: strings.DraftOrder,
          animation: 'none',
          headerStyle: {
            backgroundColor: colors.darkerGrey,
          },
          headerTintColor: 'white',
          headerLeft: navigateBackBtn,
          headerBackVisible: false,
        })}
      />

      <Stack.Screen
        name={ScreenNames.ProfileScreen}
        component={ProfileScreen}
        options={{
          animation: 'simple_push',
          headerStyle: {
            backgroundColor: colors.grey,
          },
          headerTintColor: 'white',
          headerLeft: navigateBackBtn,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name={ScreenNames.RestaurantSettingsScreen}
        component={RestaurantSettingsScreen}
        options={{
          animation: 'slide_from_right',
          headerStyle: {
            backgroundColor: colors.grey,
          },
          headerTintColor: 'white',
          headerLeft: navigateBackBtn,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name={ScreenNames.ManageProductsScreen}
        component={ManageProductsScreen}
        options={{
          animation: 'slide_from_right',
          headerStyle: {
            backgroundColor: colors.grey,
          },
          headerTintColor: 'white',
          headerLeft: navigateBackBtn,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name={ScreenNames.ItemDetailsScreen}
        component={ItemDetailsScreen}
        options={({ route }: any) => ({
          animation: 'fade_from_bottom',
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={route.params?.item?.title}
            ></CustomNavigationScreenHeaderTitle>
          ),
          headerStyle: {
            backgroundColor: colors.grey,
          },
          headerRight: () => {
            return (
              <View>
                <Tooltip
                  popover={
                    <View
                      style={{ alignItems: 'flex-start', justifyContent: 'flex-start', gap: 10 }}
                    >
                      <Text style={styles.toolTipText}>
                        {route.params?.item?.category?.title
                          ? `Κατηγορία: ${route.params.item.category.title}`
                          : null}
                      </Text>
                      <Text style={styles.toolTipText}>
                        {route.params?.item?.cost
                          ? `Κόστος: ${route.params?.item?.cost.toFixed(2)}`
                          : null}
                      </Text>
                      <Text style={styles.toolTipText}>
                        {route.params?.item?.description
                          ? `Περιγραφή: ${route.params.item.description}`
                          : null}
                      </Text>
                      {/* Make tooltip content go to flex-start */}
                      <Text style={styles.toolTipText}>{' '.repeat(100)}</Text>
                    </View>
                  }
                  backgroundColor={colors.darkGrey}
                  height="auto"
                  width="80%"
                  actionType="press"
                >
                  <Icon name={'information-circle-outline'} size={24} color={'#fff'}></Icon>
                </Tooltip>
              </View>
            );
          },

          headerLeft: navigateBackBtn,
          headerBackVisible: false,
        })}
      />
    </Stack.Navigator>
  );
};

const MainTabs = ({ route }: any) => {
  const [index, setIndex] = useState(0);

  // useEffect(
  //   useCallback(() => {
  //     if (route.params?.screenIndex !== undefined) {
  //       setIndex(route.params.screenIndex);
  //     }

  //   }, [route.params?.screenIndex])
  // );

  useEffect(() => {
    if (route.params?.screenIndex !== undefined) {
      setIndex(route.params.screenIndex);
    }
  }, [route]);

  const routes = [
    { key: strings.Tables, title: strings.Tables, focusedIcon: 'apps' },
    {
      key: strings.Draft,
      title: strings.Draft,
      focusedIcon: 'clipboard-outline',
    },
    // { key: strings.Login, title: strings.Login, focusedIcon: 'heart-outline' },
  ];

  const renderScene = BottomNavigation.SceneMap({
    [strings.Tables]: TablesScreen,
    [strings.Draft]: TempOrderScreen,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      barStyle={{ backgroundColor: colors.darkerGrey }}
      activeColor="#147eb8"
      inactiveColor="#FFFFFF"
      sceneAnimationEnabled={true}
    />
  );
};

function navigateBackBtn() {
  return (
    <TouchableOpacity onPress={() => navigateBack()}>
      <Icon name="arrow-back" size={30} color="white" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toolTipText: { color: colors.white, fontSize: 16 },
});

export enum ScreenNames {
  MainTabs = 'MainTabs',
  NewOrderScreen = 'newOrderScreen',
  ItemListScreen = 'itemListScreen',
  TempOrderScreen = 'tempOrderScreen',
  ProfileScreen = 'profileScreen',
  ItemDetailsScreen = 'itemDetailsScreen',
  RestaurantSettingsScreen = 'restaurantSettingsScreen',
  ManageProductsScreen = 'manageProductsScreen',
  LoginScreen = 'loginScreen',
  StartLoadingScreen = 'startLoadingScreen',
  RegisterScreen = 'registerScreen',
}
export default AppNavigator;
