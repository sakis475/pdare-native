import React, { useEffect, useState } from 'react';
import { ActivityIndicator, PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator, { navigationRef } from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import { setLocalizedStrings } from './src/core/strings';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PortalProvider } from '@gorhom/portal';
import { BASE_DOMAIN, ENV_TYPE } from './src/storage/env';
import { socketManager } from './src/helpers/Sockets/SocketManager';
import { socketEventSubscriber } from './src/helpers/Sockets/SocketEventSubscriber';
import { getStorage } from './src/storage/store';

const App = () => {
  const [localizedStringsLoaded, setLocalizedStringsLoaded] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      await setLocalizedStrings();
      setLocalizedStringsLoaded(true);
      if (ENV_TYPE === 'DEV') {
        require('./src/helpers/Reactotron.js');
        console.log(await getStorage('session_bearer'), 'session_bearer');
      }

      await socketManager.updateUserInstance();

      socketManager.connect(BASE_DOMAIN);
      socketEventSubscriber.initialize();
    };
    initializeApp();
  }, []);

  if (!localizedStringsLoaded) {
    // You can render a loading indicator here while the strings are being loaded
    return <ActivityIndicator animating={true} />;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <NavigationContainer ref={navigationRef}>
            <PaperProvider>
              <PortalProvider>
                <AppNavigator />
              </PortalProvider>
              <Toast />
            </PaperProvider>
          </NavigationContainer>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App;
