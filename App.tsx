import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';
import { errorHandler } from './src/errorHandler/error-handler';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, DefaultTheme, PaperProvider, Text } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';

import { setLocalizedStrings, strings } from './src/core/localization/strings';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { PortalProvider } from '@gorhom/portal';
import { BASE_DOMAIN, ENV_TYPE } from './src/storage/env';
import { socketManager } from './src/helpers/Sockets/SocketManager';
import { socketEventSubscriber } from './src/helpers/Sockets/SocketEventSubscriber';
import { getStorage } from './src/storage/store';
import AppNavigator, { navigationRef } from './src/navigation/AppNavigator';
import { LanguageProvider } from './src/core/localization/languageContext';
import { ErrorBoundary } from './src/errorHandler/ErrorBoundary';
import GlobalStore from './src/storage/GlobalStore';
import { HelpProvider } from './src/providers/HelpContext';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/helpers/config/toastConfig';
import KeepAwake from '@sayem314/react-native-keep-awake';
import { Alert, BackHandler, StatusBar, View } from 'react-native';
import { colors } from './src/core/theme';
const App = () => {
  const [localizedStringsLoaded, setLocalizedStringsLoaded] = useState(false);

  setJSExceptionHandler(errorHandler, true);

  setNativeExceptionHandler((errorString) => {
    console.log('setNativeExceptionHandler', errorString);
  });

  useEffect(() => {
    const initializeApp = async () => {
      console.log('App.tsx initializeApp');
      await setLocalizedStrings();
      setLocalizedStringsLoaded(true);
      if (ENV_TYPE === 'DEV') {
        // require('./src/helpers/Reactotron.js');
        console.log(await getStorage('session_bearer'), 'session_bearer');
      }

      // await socketManager.updateUserInstance();

      // socketManager.connect();
      // socketEventSubscriber.initialize();

      const user = await getStorage('currentUser');
      const currencySymbol = user?.restaurant?.currencySymbol;
      GlobalStore.getInstance().setValue('currencySymbol', currencySymbol);
    };

    const onBackPress = () => {
      Alert.alert(
        strings.EXIT_APP,
        strings.EXIT_CONFIRMATION,
        [
          {
            text: strings.CANCEL,
            onPress: () => {
              // Do nothing
            },
            style: 'cancel',
          },
          { text: strings.EXIT, onPress: () => BackHandler.exitApp() },
        ],
        { cancelable: false }
      );

      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    initializeApp();

    return () => backHandler.remove();
  }, []);

  if (!localizedStringsLoaded) {
    // You can render a loading indicator here while the strings are being loaded
    return <ActivityIndicator animating={true} />;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.darkGrey,
          }}
        >
          {/* <StatusBar barStyle="light-content" translucent={false} /> */}
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
              <NavigationContainer ref={navigationRef}>
                <KeepAwake />
                <PaperProvider>
                  <PortalProvider>
                    <LanguageProvider>
                      <HelpProvider>
                        <AppNavigator />
                      </HelpProvider>
                    </LanguageProvider>
                  </PortalProvider>
                </PaperProvider>
              </NavigationContainer>
              <Toast config={toastConfig} />
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
          <View style={{ height: 25, backgroundColor: 'black' }}></View>
        </View>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
};

export default App;
