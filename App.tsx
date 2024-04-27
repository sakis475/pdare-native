import React, { useEffect, useState } from 'react';
import { ActivityIndicator, PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

import Toast from 'react-native-toast-message';
import { setLocalizedStrings } from './src/core/strings';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const App = () => {
  const [localizedStringsLoaded, setLocalizedStringsLoaded] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      await setLocalizedStrings();
      setLocalizedStringsLoaded(true);
    };
    initializeApp();
  }, []);

  if (!localizedStringsLoaded) {
    // You can render a loading indicator here while the strings are being loaded
    return <ActivityIndicator animating={true} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <NavigationContainer>
          <PaperProvider>
            <AppNavigator />
            <Toast />
          </PaperProvider>
        </NavigationContainer>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

export default App;
