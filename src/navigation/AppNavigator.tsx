import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
import { TouchableOpacity } from 'react-native';
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
import AdminTableScreen from '../screens/adminScreens/AdminTableScreen';
import { navigateBack, ScreenNames } from './navigationUtils';
import AdminPersonelScreen from '../screens/adminScreens/AdminPersonelScreen';
import NewUserSetupScreen from '../screens/authenticationScreens/NewUserSetupScreen';
import AdminPrintersScreen from '../screens/adminScreens/AdminPrintersScreen';
import { BackIcon } from '../components/basic/Icons';
import MainTabs from './MainTabs';
import { HelpPressable } from '../components/guides/HelpPressable';
import { useHelpModal } from '../providers/HelpContext';
import PatternGuide from '../components/guides/guides/PatternGuide';
import PrinterGuide from '../components/guides/guides/PrintersGuide';
import VerifyEmailScreen from '../screens/authenticationScreens/VerifyEmailScreen';
import AboutScreen from '../screens/AboutScreen';

const Stack = createNativeStackNavigator();

export const navigationRef = React.createRef<NavigationContainerRef<any>>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerTitleAlign: 'center', orientation: 'portrait' }}
      initialRouteName={ScreenNames.StartLoadingScreen}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false, animation: 'none' }}
      />

      <Stack.Screen
        name={ScreenNames.StartLoadingScreen}
        component={StartLoadingScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />

      <Stack.Screen
        name={ScreenNames.NewUserSetupScreen}
        component={NewUserSetupScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />

      <Stack.Screen
        name={ScreenNames.VerifyEmailScreen}
        component={VerifyEmailScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />

      <Stack.Screen
        name={ScreenNames.LoginScreen}
        component={LoginScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />

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
              title={strings.SETTINGS}
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
        name={ScreenNames.AboutScreen}
        component={AboutScreen}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={strings.ABOUT_APP}
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
              title={`${strings.UPDATE}: ${route.params?.item?.title}`}
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
          headerRight: () => {
            const { openHelpModal } = useHelpModal();
            return (
              <HelpPressable
                onPress={() => openHelpModal(<PatternGuide></PatternGuide>, strings.MORE_INFO)}
              />
            );
          },
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
        name={ScreenNames.ManagePrintersScreen}
        component={AdminPrintersScreen}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={strings.PRINTERS}
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
          headerRight: () => {
            const { openHelpModal } = useHelpModal();
            return (
              <HelpPressable
                onPress={() => openHelpModal(<PrinterGuide></PrinterGuide>, strings.MORE_INFO)}
              />
            );
          },
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
          headerLeft: navigateBackBtn,
          headerBackVisible: false,
        })}
      />
    </Stack.Navigator>
  );
};
function navigateBackBtn() {
  return (
    <TouchableOpacity onPress={() => navigateBack()} style={{ minWidth: 50 }}>
      <BackIcon size={30}></BackIcon>
    </TouchableOpacity>
  );
}
export default AppNavigator;
