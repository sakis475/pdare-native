import React, { useEffect, useMemo, useState } from 'react';
import { BottomNavigation, DefaultTheme, Text } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TablesScreen from '../screens/TablesScreen';
import LoginScreen from '../screens/authenticationScreens/LoginScreen';
import { strings } from '../core/localization/strings';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../core/theme';
import RestaurantSettingsScreen from '../screens/adminScreens/RestaurantSettingsScreen';
import NewOrderScreen from '../screens/orderScreens/newOrderScreen';
import { NavigationContainerRef, Route } from '@react-navigation/native';
import TempOrderScreen from '../screens/orderScreens/tempOrderScreen';
import ItemListScreen from '../screens/orderScreens/ItemListScreen';
import ItemDetailsScreen from '../screens/orderScreens/ItemDetailsScreen';
import Tooltip from 'rn-tooltip';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomNavigationScreenHeaderTitle from '../components/basic/CustomNavigationScreenHeaderTitle';
import RegisterScreen from '../screens/authenticationScreens/RegisterScreen';
import StartLoadingScreen from '../screens/StartLoadingScreen';
import ActiveOrderScreen from '../screens/orderScreens/activeOrderScreens/ActiveOrderScreen';
import HistoryOrdersScreen from '../screens/HistoryOrdersScreen';
import AdminCategoryScreen from '../screens/adminScreens/AdminCategoryScreen';
import AdminItemListScreen from '../screens/adminScreens/AdminItemListScreen';
import AdminItemDetailsScreen from '../screens/adminScreens/AdminItemDetailsScreen';
import AdminItemDetailsPatternScreen from '../screens/adminScreens/AdminItemDetailsPatternScreen';
import AdminItemDetailsPatternEditScreen from '../screens/adminScreens/AdminItemDetailsPatternEditScreen';
import ExpoScreen from '../screens/ExpoScreen';
import AdminTableScreen from '../screens/adminScreens/AdminTableScreen';
import { navigateBack, ScreenNames } from './navigationUtils';
import AdminPersonelScreen from '../screens/adminScreens/AdminPersonelScreen';
import NewUserSetupScreen from '../screens/authenticationScreens/NewUserSetupScreen';
import { useStrings } from '../core/localization/languageContext';
const Stack = createNativeStackNavigator();

export const navigationRef = React.createRef<NavigationContainerRef<any>>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerTitleAlign: 'center', orientation: 'portrait' }}
      // initialRouteName={ScreenNames.ManageItemsScreen}
    >
      <Stack.Screen
        name={ScreenNames.StartLoadingScreen}
        component={StartLoadingScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name={ScreenNames.NewUserSetupScreen}
        component={NewUserSetupScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name={ScreenNames.LoginScreen}
        component={LoginScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />

      <Stack.Screen
        name={ScreenNames.RegisterScreen}
        component={RegisterScreen}
        options={({ route }: any) => ({
          headerTitle: () => {
            return (
              <CustomNavigationScreenHeaderTitle
                title={strings.REGISTER}
              ></CustomNavigationScreenHeaderTitle>
            );
          },
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
        name={ScreenNames.NewOrderScreen}
        component={NewOrderScreen}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={
                !!route.params?.table?.occupiedByOrder ? strings.UPDATE_ORDER : strings.NEW_ORDER
              }
              subtitle={route?.params?.table?.tableName}
            ></CustomNavigationScreenHeaderTitle>
          ),
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
        name={ScreenNames.ActiveOrderScreen}
        component={ActiveOrderScreen}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={route.params?.tableParam?.tableName}
            ></CustomNavigationScreenHeaderTitle>
          ),
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
        name={ScreenNames.ItemListScreen}
        component={ItemListScreen}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={strings.ADD_ITEMS}
            ></CustomNavigationScreenHeaderTitle>
          ),
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
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={
                !!route.params?.table?.occupiedByOrder ? strings.UPDATE_ORDER : strings.NEW_ORDER
              }
            ></CustomNavigationScreenHeaderTitle>
          ),
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
        name={ScreenNames.RestaurantSettingsScreen}
        component={RestaurantSettingsScreen}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={strings.ACCOUNT}
              bold={true}
            ></CustomNavigationScreenHeaderTitle>
          ),
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
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={strings.PROFILE}
              bold={true}
            ></CustomNavigationScreenHeaderTitle>
          ),
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
        name={ScreenNames.HistoryOrdersScreen}
        component={HistoryOrdersScreen}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={strings.ORDER_HISTORY}
              bold={true}
            ></CustomNavigationScreenHeaderTitle>
          ),
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
        name={ScreenNames.ManageCategoriesScreen}
        component={AdminCategoryScreen}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={strings.MANAGE_CATEGORY}
              bold={true}
            ></CustomNavigationScreenHeaderTitle>
          ),
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
        name={ScreenNames.ManageItemsScreen}
        component={AdminItemListScreen}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={strings.MANAGE_PRODUCTS}
              bold={true}
            ></CustomNavigationScreenHeaderTitle>
          ),
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
        name={ScreenNames.ManageItemDetailsScreen}
        component={AdminItemDetailsScreen}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={route.params?.item?.title}
              bold={true}
            ></CustomNavigationScreenHeaderTitle>
          ),
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
        name={ScreenNames.ManageItemDetailsPatternScreen}
        component={AdminItemDetailsPatternScreen}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={strings.PROPERTY_TEMPLATES}
              bold={true}
            ></CustomNavigationScreenHeaderTitle>
          ),
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
        name={ScreenNames.AdminPersonelScreen}
        component={AdminPersonelScreen}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={strings.STAFF}
              bold={true}
            ></CustomNavigationScreenHeaderTitle>
          ),
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
        name={ScreenNames.ManageItemDetailsPatternEditScreen}
        component={AdminItemDetailsPatternEditScreen}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={strings.PATTERN_PREFIX + ' ' + route.params?.pattern?.propertyPatternTitle}
              bold={true}
            ></CustomNavigationScreenHeaderTitle>
          ),
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
        name={ScreenNames.ManageTableScreen}
        component={AdminTableScreen}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={strings.MANAGE_TABLES}
              bold={true}
            ></CustomNavigationScreenHeaderTitle>
          ),
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
            backgroundColor: colors.darkerGrey,
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
                          ? `${strings.CATEGORY_LABEL} ${route.params.item.category.title}`
                          : null}
                      </Text>
                      <Text style={styles.toolTipText}>
                        {route.params?.item?.cost
                          ? `${strings.COST_LABEL} ${route.params?.item?.cost.toFixed(2)}`
                          : null}
                      </Text>
                      <Text style={styles.toolTipText}>
                        {route.params?.item?.description
                          ? `${strings.DESCRIPTION_LABEL} ${route.params.item.description}`
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
  const strings = useStrings(); // Make sure you have this
  const [index, setIndex] = useState(route?.params?.screenIndex ?? 0);

  useEffect(() => {
    if (typeof route.params?.screenIndex === 'number') {
      setIndex(route.params.screenIndex);
    }
  }, [route]);

  // Move routes to useMemo to update when strings change
  const routes = useMemo(
    () => [
      {
        key: 'tables',
        title: strings.TABLES,
        focusedIcon: 'apps',
      },
      {
        key: 'draft',
        title: strings.DRAFT,
        focusedIcon: 'clipboard-outline',
      },
      {
        key: 'expo',
        title: strings.EXPO,
        focusedIcon: 'clipboard-multiple-outline',
      },
    ],
    [strings]
  ); // Depend on strings to update when language changes

  const renderScene = ({ route }: any) => {
    switch (route.key) {
      case 'tables':
        return <TablesScreen currentIndex={index} />;
      case 'draft':
        return <TempOrderScreen currentIndex={index} />;
      case 'expo':
        return <ExpoScreen currentIndex={index} />;
      default:
        return null;
    }
  };

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      barStyle={{ backgroundColor: colors.darkerGrey, height: 70 }}
      activeColor="#147eb8"
      inactiveColor="#FFFFFF"
      sceneAnimationEnabled={false}
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

export default AppNavigator;
