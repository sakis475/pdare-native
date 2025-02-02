import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { BottomNavigation } from 'react-native-paper';
import { useStrings } from '../core/localization/languageContext';
import TablesScreen from '../screens/TablesScreen';
import TempOrderScreen from '../screens/orderScreens/tempOrderScreen';
import ExpoScreen from '../screens/ExpoScreen';
import { colors } from '../core/theme';

const MainTabs = ({ route }: any) => {
  const strings = useStrings();
  const [index, setIndex] = useState(route?.params?.screenIndex ?? 1);

  useEffect(() => {
    if (typeof route.params?.screenIndex === 'number') {
      setIndex(route.params.screenIndex);
    }
  }, [route]);

  // Memoize routes to prevent recreating on every render
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
  );

  // Memoize the renderScene function
  const renderScene = useCallback(
    ({ route }: { route: any }) => {
      const scenes: Record<any['key'], () => JSX.Element> = {
        tables: () => <TablesScreen currentIndex={index} />,
        draft: () => <TempOrderScreen currentIndex={index} />,
        expo: () => <ExpoScreen currentIndex={index} />,
      };

      return scenes[route.key]();
    },
    [index]
  );

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      barStyle={{ backgroundColor: colors.darkerGrey, height: 70 }}
      activeColor="#147eb8"
      inactiveColor="#FFFFFF"
      sceneAnimationEnabled={false}
      shifting={false} // Add this if you want to disable the shifting animation
      compact // Add this if you want a more compact navigation bar
    />
  );
};

export default React.memo(MainTabs);
