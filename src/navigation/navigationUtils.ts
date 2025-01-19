import { navigationRef } from './AppNavigator';

export enum ScreenNames {
  MainTabs = 'MainTabs',
  NewOrderScreen = 'newOrderScreen',
  ItemListScreen = 'itemListScreen',
  TempOrderScreen = 'tempOrderScreen',
  ProfileScreen = 'profileScreen',
  ItemDetailsScreen = 'itemDetailsScreen',
  RestaurantSettingsScreen = 'restaurantSettingsScreen',
  AdminPersonelScreen = 'AdminPersonelScreen',
  ManageCategoriesScreen = 'manageCategoriesScreen',
  ManageTableScreen = 'manageTableScreen',
  ManageItemsScreen = 'manageItemsScreen',
  ManageItemDetailsScreen = 'manageItemsDetailsScreen',
  ManageItemDetailsPatternScreen = 'manageItemDetailsPatternScreen',
  ManageItemDetailsPatternEditScreen = 'manageItemDetailsPatternEditScreen',
  ManagePrintersScreen = 'managePrintersScreen',
  LoginScreen = 'loginScreen',
  StartLoadingScreen = 'startLoadingScreen',
  RegisterScreen = 'registerScreen',
  ActiveOrderScreen = 'activeOrderScreen',
  NewUserSetupScreen = 'newUserSetupScreen',
  HistoryOrdersScreen = 'historyOrdersScreen',
}

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
