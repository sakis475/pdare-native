import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Text, Divider, TextInput, MD3LightTheme } from 'react-native-paper';
import { LongPressGestureHandler, ScrollView, State } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors } from '../../core/theme';
import { login } from '../../helpers/storage/tokenRequests';
import { navigate, ScreenNames } from '../../navigation/navigationUtils';
import { getStorageLastCredentials } from '../../helpers/storage/otherStorage';
import { useStrings } from '../../core/localization/languageContext';
import CustomTextInput from '../../components/basic/CustomTextInput';
import CustomButton from '../../components/basic/CustomButton';

const { width, height } = Dimensions.get('window');
const logoImage = require('../../../assets/mywaitericon.png');
const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const strings = useStrings();

  // Add ref for ScrollView
  const scrollViewRef = useRef(null);

  // Function to handle input focus
  const handleInputFocus = (yPosition: any) => {
    // Wait for keyboard to show up before scrolling
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: yPosition,
        animated: true,
      });
    }, 100);
  };
  const emailValidator = (email: string) => {
    if (!email) return strings.EMAIL_REQUIRED;

    if (email.includes('@')) {
      const re = /\S+@\S+\.\S+/;
      if (!re.test(email)) return strings.ERROR_EMAIL_INVALID;
    }
    return '';
  };

  const passwordValidator = (password: string) => {
    if (!password) return strings.PASSWORD_REQUIRED;
    if (password.length < 5) return strings.PASSWORD_LENGTH;
    return '';
  };

  const handleGetLastCredentials = async () => {
    const credentials = await getStorageLastCredentials();
    if (!credentials) return;

    setEmail(credentials.email);
    if (credentials.email) {
      setPassword(credentials.password);
    }
  };

  useEffect(() => {
    handleGetLastCredentials();
  }, []);

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
      console.log(error);
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollViewContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.logoContainer}>
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
              <Text style={styles.appDescription}>{strings.APP_DESCRIPTION}</Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.formContainer}>
              <Text style={styles.header}>{strings.LOGIN}</Text>

              <View style={styles.inputsContainer}>
                <View style={styles.inputWrapper}>
                  <CustomTextInput
                    label={strings.EMAIL}
                    value={email}
                    onChangeText={setEmail}
                    error={!!emailError}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    disabled={isLoading}
                    onFocus={() => handleInputFocus(200)}
                  />
                  {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
                </View>

                <View style={styles.inputWrapper}>
                  <CustomTextInput
                    label={strings.PASSWORD}
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                    error={!!passwordError}
                    secureTextEntry={true}
                    disabled={isLoading}
                    onFocus={() => handleInputFocus(200)}
                  />
                  {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
                </View>
              </View>

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>{strings.RESET_PASSWORD}</Text>
              </TouchableOpacity>

              <CustomButton onPress={_onLoginPressed} loading={isLoading}>
                <Text style={styles.buttonText}>{strings.LOGIN}</Text>
              </CustomButton>
            </View>

            <TouchableOpacity style={styles.registerButton} onPress={handlePressRegister}>
              <Text style={styles.registerText}>{strings.CREATE_NEW_ACCOUNT}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.lightBlack,
  },
  keyboardView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  container: {
    flex: 1,
    paddingHorizontal: width * 0.05, // 5% of screen width
    paddingVertical: height * 0.02, // 2% of screen height
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: height * 0.02,
  },
  logo: {
    width: Math.min(width * 0.3, 150), // 30% of screen width, max 150
    height: Math.min(width * 0.3, 150),
    marginBottom: height * 0.01,
  },
  appTitle: {
    fontSize: Math.min(width * 0.1, 42), // Responsive font size
    letterSpacing: 6,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: height * 0.005,
    color: colors.white,
  },
  appDescription: {
    width: '70%',
    textAlign: 'center',
    color: colors.veryLighterGrey,
    fontSize: Math.min(width * 0.04, 16),
  },
  divider: {
    height: 1,
    backgroundColor: colors.white,
    marginVertical: height * 0.02,
  },
  formContainer: {
    backgroundColor: '#383838',
    padding: width * 0.05,
    borderRadius: 10,
    borderColor: colors.black,
  },
  header: {
    fontSize: Math.min(width * 0.06, 24),
    fontWeight: 'bold',
    paddingVertical: height * 0.01,
    color: colors.white,
  },
  inputsContainer: {
    gap: height * 0.015,
  },
  inputWrapper: {
    marginBottom: height * 0.01,
  },
  forgotPassword: {
    marginTop: height * 0.01,
  },
  forgotPasswordText: {
    textAlign: 'right',
    fontSize: Math.min(width * 0.03, 12),
    color: colors.veryLighterGrey,
  },
  button: {
    backgroundColor: colors.slightlyLighterGrey,
    borderWidth: 1,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: height * 0.01,
    borderRadius: 6,
    height: height * 0.07,
    marginTop: height * 0.02,
  },
  buttonDisabled: {
    opacity: 0.7,
    backgroundColor: colors.grey,
  },
  buttonText: {
    fontSize: Math.min(width * 0.04, 16),
    color: colors.white,
  },
  error: {
    fontSize: Math.min(width * 0.035, 14),
    color: colors.lightRed,
    paddingVertical: 4,
  },
  registerButton: {
    marginTop: height * 0.02,
  },
  registerText: {
    textAlign: 'center',
    fontSize: Math.min(width * 0.035, 14),
    color: colors.veryLighterGrey,
  },
});

export default LoginScreen;
