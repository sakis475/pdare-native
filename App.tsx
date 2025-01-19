import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';
import { errorHandler } from './src/errorHandler/error-handler';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, DefaultTheme, PaperProvider } from 'react-native-paper';
import { NavigationContainer, Theme } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { setLocalizedStrings } from './src/core/localization/strings';
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
const App = () => {
  const [localizedStringsLoaded, setLocalizedStringsLoaded] = useState(false);

  setJSExceptionHandler(errorHandler, true);

  setNativeExceptionHandler((errorString) => {
    console.log('setNativeExceptionHandler', errorString);
  });

  useEffect(() => {
    const initializeApp = async () => {
      await setLocalizedStrings();
      setLocalizedStringsLoaded(true);
      if (ENV_TYPE === 'DEV') {
        // require('./src/helpers/Reactotron.js');
        console.log(await getStorage('session_bearer'), 'session_bearer');
      }

      await socketManager.updateUserInstance();

      socketManager.connect();
      socketEventSubscriber.initialize();

      const user = await getStorage('currentUser');
      const currencySymbol = user?.restaurant?.currencySymbol;
      GlobalStore.getInstance().setValue('currencySymbol', currencySymbol);
    };
    initializeApp();
  }, []);

  if (!localizedStringsLoaded) {
    // You can render a loading indicator here while the strings are being loaded
    return <ActivityIndicator animating={true} />;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <SafeAreaView style={{ flex: 1 }}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
              <NavigationContainer ref={navigationRef}>
                <PaperProvider>
                  <PortalProvider>
                    <LanguageProvider>
                      <AppNavigator />
                    </LanguageProvider>
                  </PortalProvider>
                  <Toast />
                </PaperProvider>
              </NavigationContainer>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </SafeAreaView>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
};

export default App;
