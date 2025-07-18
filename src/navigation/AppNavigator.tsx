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
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

export const navigationRef = React.createRef<NavigationContainerRef<any>>();

// Helper to wrap screens with insets
function withInsets(ScreenComponent: React.ComponentType<any>) {
  return function ScreenWithInsets(props: any) {
    const insets = useSafeAreaInsets();
    return (
      <View style={{ flex: 1, paddingBottom: insets.bottom, backgroundColor: colors.darkGrey }}>
        <ScreenComponent {...props} />
      </View>
    );
  };
}

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        orientation: 'portrait',
        animation: 'fade_from_bottom',
      }}
      initialRouteName={ScreenNames.StartLoadingScreen}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false, animation: 'none' }}
      />

      <Stack.Screen
        name={ScreenNames.StartLoadingScreen}
        component={withInsets(StartLoadingScreen)}
        options={{ headerShown: false, gestureEnabled: false, animation: 'none' }}
      />

      <Stack.Screen
        name={ScreenNames.NewUserSetupScreen}
        component={withInsets(NewUserSetupScreen)}
        options={{ headerShown: false, gestureEnabled: false }}
      />

      <Stack.Screen
        name={ScreenNames.VerifyEmailScreen}
        component={withInsets(VerifyEmailScreen)}
        options={{ headerShown: false, gestureEnabled: false }}
      />

      <Stack.Screen
        name={ScreenNames.LoginScreen}
        component={withInsets(LoginScreen)}
        options={{ headerShown: false, gestureEnabled: false }}
      />

      <Stack.Screen
        name={ScreenNames.RegisterScreen}
        component={withInsets(RegisterScreen)}
        options={({ route }: any) => ({
          headerTitle: () => {
            return (
              <CustomNavigationScreenHeaderTitle
                title={strings.REGISTER}
              ></CustomNavigationScreenHeaderTitle>
            );
          },
          animation: 'fade_from_bottom',
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
        component={withInsets(NewOrderScreen)}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={
                !!route.params?.table?.occupiedByOrder ? strings.UPDATE_ORDER : strings.NEW_ORDER
              }
              subtitle={route?.params?.table?.tableName}
            ></CustomNavigationScreenHeaderTitle>
          ),
          animation: 'fade_from_bottom',
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
        component={withInsets(ActiveOrderScreen)}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={route.params?.tableParam?.tableName}
            ></CustomNavigationScreenHeaderTitle>
          ),
          animation: 'fade_from_bottom',
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
        component={withInsets(ItemListScreen)}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={strings.ADD_ITEMS}
            ></CustomNavigationScreenHeaderTitle>
          ),
          animation: 'fade_from_bottom',
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
        component={withInsets(TempOrderScreen)}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={
                !!route.params?.table?.occupiedByOrder ? strings.UPDATE_ORDER : strings.NEW_ORDER
              }
            ></CustomNavigationScreenHeaderTitle>
          ),
          animation: 'fade_from_bottom',
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
        component={withInsets(RestaurantSettingsScreen)}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={strings.SETTINGS}
              bold={true}
            ></CustomNavigationScreenHeaderTitle>
          ),
          animation: 'fade_from_bottom',
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
        component={withInsets(ProfileScreen)}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={strings.PROFILE}
              bold={true}
            ></CustomNavigationScreenHeaderTitle>
          ),
          animation: 'fade_from_bottom',
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
        component={withInsets(AboutScreen)}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={strings.ABOUT_APP}
              bold={true}
            ></CustomNavigationScreenHeaderTitle>
          ),
          animation: 'fade_from_bottom',
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
        component={withInsets(HistoryOrdersScreen)}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={strings.ORDER_HISTORY}
              bold={true}
            ></CustomNavigationScreenHeaderTitle>
          ),
          animation: 'fade_from_bottom',
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
        component={withInsets(AdminCategoryScreen)}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={strings.MANAGE_CATEGORY}
              bold={true}
            ></CustomNavigationScreenHeaderTitle>
          ),
          animation: 'fade_from_bottom',
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
        component={withInsets(AdminItemListScreen)}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={strings.MANAGE_PRODUCTS}
              bold={true}
            ></CustomNavigationScreenHeaderTitle>
          ),
          animation: 'fade_from_bottom',
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
        component={withInsets(AdminItemDetailsScreen)}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={`${strings.UPDATE}: ${route.params?.item?.title}`}
              bold={true}
            ></CustomNavigationScreenHeaderTitle>
          ),
          animation: 'fade_from_bottom',
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
        component={withInsets(AdminItemDetailsPatternScreen)}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={strings.PROPERTY_TEMPLATES}
              bold={true}
            ></CustomNavigationScreenHeaderTitle>
          ),
          animation: 'fade_from_bottom',
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
        component={withInsets(AdminPersonelScreen)}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={strings.STAFF}
              bold={true}
            ></CustomNavigationScreenHeaderTitle>
          ),
          animation: 'fade_from_bottom',
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
        component={withInsets(AdminItemDetailsPatternEditScreen)}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={strings.PATTERN_PREFIX + ' ' + route.params?.pattern?.propertyPatternTitle}
              bold={true}
            ></CustomNavigationScreenHeaderTitle>
          ),
          animation: 'fade_from_bottom',
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
        component={withInsets(AdminTableScreen)}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={strings.MANAGE_TABLES}
              bold={true}
            ></CustomNavigationScreenHeaderTitle>
          ),
          animation: 'fade_from_bottom',
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
        component={withInsets(AdminPrintersScreen)}
        options={({ route }: any) => ({
          headerTitle: () => (
            <CustomNavigationScreenHeaderTitle
              title={strings.PRINTERS}
              bold={true}
            ></CustomNavigationScreenHeaderTitle>
          ),
          animation: 'fade_from_bottom',
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
        component={withInsets(ItemDetailsScreen)}
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
