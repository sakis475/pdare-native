import { navigationRef } from './AppNavigator';

type NavigationRoute = {
  name: ScreenNames;
  params?: object;
};

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

//Last screen is the screen to navigate to.
export function navigateWithReset(
  screens: (ScreenNames | NavigationRoute)[],
  activeScreenIndex: number = screens.length - 1
) {
  if (navigationRef.current) {
    // Get the target screen info
    const targetScreen = screens[activeScreenIndex];
    const targetName = typeof targetScreen === 'string' ? targetScreen : targetScreen.name;
    const targetParams = typeof targetScreen === 'string' ? undefined : targetScreen.params;

    // First navigate to the target screen
    navigationRef.current.navigate(targetName, targetParams);

    // Then reset the navigation stack
    navigationRef.current.reset({
      index: activeScreenIndex,
      routes: screens.map((screen) => {
        if (typeof screen === 'string') {
          return { name: screen };
        }
        return { name: screen.name, params: screen.params };
      }),
    });
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
