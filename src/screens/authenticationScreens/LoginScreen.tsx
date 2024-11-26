import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Divider, TextInput, MD3LightTheme } from 'react-native-paper';
import { LongPressGestureHandler, ScrollView, State } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../core/theme';
import { login } from '../../helpers/storage/tokenRequests';
import { navigate, ScreenNames } from '../../navigation/navigationUtils';

const logoImage = require('../../../assets/mywaitericon.png');

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const emailValidator = (email: string) => {
    if (!email) return 'Πρέπει να εισάγεται το Email σας';

    if (email.includes('@')) {
      const re = /\S+@\S+\.\S+/;
      if (!re.test(email)) return 'Ουυπς.Το Email δεν είναι έγκυρο';
    }
    return '';
  };

  const passwordValidator = (password: string) => {
    if (!password) return 'Πρέπει να εισάγεται τον Κωδικό σας';
    if (password.length < 5) return 'Ο κωδικός πρέπει να είναι τουλάχιστον 5 χαρακτήρες μεγάλος';
    return '';
  };

  useEffect(() => {
    setEmailError('');
    setPasswordError('');
  }, [email, password]);

  const _onLoginPressed = async () => {
    const emailError = emailValidator(email);
    const passwordError = passwordValidator(password);

    emailError ? setEmailError(emailError) : setEmailError('');
    passwordError ? setPasswordError(passwordError) : setPasswordError('');
    if (emailError || passwordError) {
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      // Handle error if needed
    } finally {
      setIsLoading(false);
    }
  };

  // Shared value for rotation
  const rotateValue = useSharedValue(0);

  // Animated style for rotation
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotateValue.value}deg` }],
    };
  });

  // Handle long press event
  const handleLongPress = () => {
    rotateValue.value = withSpring(360, { damping: 6, stiffness: 100 }, () => {
      rotateValue.value = 0; // Reset to 0 after the rotation
    });
  };
  const handlePressRegister = () => {
    navigate(ScreenNames.RegisterScreen);
  };

  const customTheme = {
    ...MD3LightTheme,
    dark: true,
    colors: {
      ...MD3LightTheme.colors,
      primary: colors.white,
      onPrimary: colors.white,
      surface: colors.darkerGrey,
      onSurface: colors.white,
      surfaceVariant: colors.darkerGrey,
      onSurfaceVariant: colors.white,
      surfaceDisabled: colors.darkerGrey,
      onSurfaceDisabled: colors.white,
      outline: colors.lighterGrey,
      outlineVariant: colors.lighterGrey,
      backdrop: colors.darkerGrey,
    },
  };

  return (
    <ScrollView style={{ flex: 1, height: '100%', backgroundColor: colors.lightBlack }}>
      <View style={styles.container}>
        <LongPressGestureHandler
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === State.ACTIVE) {
              handleLongPress();
            }
          }}
        >
          <Animated.Image source={logoImage} style={[styles.logo, animatedStyle]} />
        </LongPressGestureHandler>
        <Text style={styles.appTitle}>OrderPOS</Text>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ width: 250, textAlign: 'center', color: colors.veryLighterGrey }}>
            Advanced Ordering App for Food and Beverages Services
          </Text>
        </View>
        <Divider style={styles.divider} />

        <View
          style={{
            backgroundColor: '#383838',
            paddingHorizontal: 25,
            paddingTop: 15,
            paddingBottom: 35,
            borderRadius: 10,
            borderColor: colors.black,
          }}
        >
          <Text style={styles.header}>Σύνδεση</Text>

          <View style={{ gap: 15 }}>
            <View>
              <TextInput
                label="Email"
                value={email}
                onChangeText={(text) => setEmail(text)}
                error={!!emailError}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                style={styles.input}
                textColor={colors.white}
                underlineColor={colors.lighterGrey}
                activeUnderlineColor={colors.white}
                disabled={isLoading}
                theme={customTheme}
              />
              {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
            </View>
            <View>
              <View style={[styles.passwordInputContainer]}>
                <TextInput
                  label="Κωδικός"
                  value={password}
                  onChangeText={(text) => setPassword(text)}
                  error={!!passwordError}
                  secureTextEntry={!isPasswordVisible}
                  style={[styles.input, { flex: 1 }]}
                  textColor={colors.white}
                  underlineColor={colors.lightGrey}
                  activeUnderlineColor={colors.white}
                  disabled={isLoading}
                  theme={customTheme}
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={styles.eyeIcon}
                >
                  <MaterialCommunityIcons
                    name={isPasswordVisible ? 'eye-off' : 'eye'}
                    size={24}
                    color={colors.white}
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
            </View>
          </View>
          <TouchableOpacity style={{ marginTop: 2 }}>
            <Text style={{ textAlign: 'right', fontSize: 12, color: colors.veryLighterGrey }}>
              Επαναφορά κωδικού πρόσβασης
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={_onLoginPressed}
            style={[styles.button, isLoading && styles.buttonDisabled]}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.text}>Σύνδεση</Text>
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={{ marginTop: 10 }} onPress={handlePressRegister}>
          <Text style={{ textAlign: 'center', fontSize: 14, color: colors.veryLighterGrey }}>
            Δημιουργία Καινούργιου Λογαριασμού
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.lightBlack,
  },
  text: {
    fontSize: 16,
    color: colors.white,
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
  divider: {
    height: 1,
    backgroundColor: colors.white,
    marginVertical: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingVertical: 14,
    textAlign: 'left',
    color: colors.white,
  },
  input: {
    backgroundColor: colors.darkerGrey,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    backgroundColor: colors.darkerGrey,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -12 }], // Centering the icon vertically (half of icon size)
  },
  button: {
    backgroundColor: colors.slightlyLighterGrey,
    borderWidth: 1,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    borderRadius: 6,
    height: 60,
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
    backgroundColor: colors.grey,
  },
  error: {
    fontSize: 14,
    color: colors.lightRed,
    paddingVertical: 4,
  },
});

export default LoginScreen;
