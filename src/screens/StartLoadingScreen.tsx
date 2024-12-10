import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Text, Animated } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { colors } from '../core/theme';
import { refreshToken } from '../helpers/requests';
import { navigate, navigateReset, ScreenNames } from '../navigation/navigationUtils';
import { handleNoRestaurantUser, logout } from '../helpers/storage/tokenRequests';
import { getStorage } from '../storage/store';
import dayjs from '../core/dayjs';
import { useStrings } from '../core/localization/languageContext';

const logoImage = require('../../assets/mywaitericon.png');

const StartLoadingScreen: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(1)).current; // Start with full opacity

  const strings = useStrings();

  useEffect(() => {
    // Continuous fade in and fade out loop
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.5, // Back to full opacity
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1, // Back to full opacity
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5, // Back to full opacity
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
  }, [fadeAnim]);

  const handleRedirect = async () => {
    // Create a timeout promise that rejects after 20 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Redirect timeout')), 5000);
    });

    try {
      // Race between your logic and the timeout
      await Promise.race([
        (async () => {
          const currentUser = await getStorage('currentUser');
          const sessionBearer = await getStorage('session_bearer');
          if (currentUser?.restaurant?.id) {
            const newToken = await refreshToken();
            if (newToken?.user?.restaurant) {
              navigateReset(ScreenNames.MainTabs);
              navigate(ScreenNames.MainTabs);
            }
          } else if (currentUser) {
            await handleNoRestaurantUser(sessionBearer);
          } else {
            throw new Error('No Current User');
          }
        })(),
        timeoutPromise,
      ]);
    } catch (error) {
      console.log(error);
      await logout();
      navigateReset(ScreenNames.LoginScreen);
      navigate(ScreenNames.LoginScreen);
    }
  };

  useEffect(() => {
    handleRedirect();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image source={logoImage} style={styles.logo} />

        <Text style={styles.appTitle}>OrderPOS</Text>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ width: 250, textAlign: 'center', color: colors.veryLighterGrey }}>
            {strings.APP_DESCRIPTION}
          </Text>
        </View>

        <View style={{ marginTop: 10, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
          <Text style={styles.text}>{strings.LOADING}</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.lightBlack,
  },
  text: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 42,
    letterSpacing: 6,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 3,
    color: colors.white,
  },
});

export default StartLoadingScreen;
