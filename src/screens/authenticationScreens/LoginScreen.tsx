import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useAnimatedKeyboard } from 'react-native-reanimated';
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
import { LanguageIcon } from '../../components/basic/Icons';
import { AppLanguage, getLanguage, setLocalizedStrings } from '../../core/localization/strings';
import LanguageSelectorModal, {
  languageOptions,
} from '../../components/popupModals/LanguageSelectorModal';
import { setStorage } from '../../storage/store';
import { EventEmitter } from '../../helpers/Sockets/EventEmitter';
import { toast } from '../../core/utils';

const { width, height } = Dimensions.get('window');
const logoImage = require('../../../assets/servetablogowhite.png');
const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isModalUserLangVisible, setModalUserLangVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>('lang_el');

  const strings = useStrings();

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
  const handleGetCurrentLanguage = async () => {
    const language = await getLanguage();
    if (!language) return;

    setSelectedLanguage(language);
  };

  useEffect(() => {
    handleGetLastCredentials();
    handleGetCurrentLanguage();
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

  const keyboard = useAnimatedKeyboard();

  const animatedFormStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -keyboard.height.value }],
  }));

  const handleLanguageChange = useCallback(
    async (language: AppLanguage) => {
      try {
        await setStorage('app_language', language);
        await setLocalizedStrings();
        setSelectedLanguage(language);
        EventEmitter.emit('LANGUAGE_CHANGED');
      } catch (error) {
        toast('error', strings.ERROR);
      }
    },
    [strings]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <View style={styles.container}>
          <View style={[styles.logoContainer]}>
            <LongPressGestureHandler
              onHandlerStateChange={({ nativeEvent }) => {
                if (nativeEvent.state === State.ACTIVE) {
                  handleLongPress();
                }
              }}
            >
              <Animated.Image source={logoImage} style={[styles.logo, animatedStyle]} />
            </LongPressGestureHandler>
            <Text style={styles.appDescription}>{strings.APP_DESCRIPTION}</Text>
            <TouchableOpacity
              onPress={() => setModalUserLangVisible(true)}
              style={{
                position: 'absolute',
                right: 8,
                top: 8,
                flexDirection: 'row',
                gap: 10,
                alignItems: 'center',
                borderColor: colors.lighterGrey,
                borderWidth: 1,
                borderRadius: 15,
                paddingVertical: 8,
                paddingHorizontal: 8,
              }}
            >
              <LanguageIcon size={16}></LanguageIcon>
              <Text style={{ color: colors.white, fontSize: 12 }}>
                {languageOptions.find((e) => e.value === selectedLanguage).label}
              </Text>
            </TouchableOpacity>
          </View>

          <Animated.View style={[styles.formContainer, animatedFormStyle]}>
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

            <CustomButton onPress={handlePressRegister} loading={isLoading} mode={'outlined'}>
              <Text style={styles.buttonText}>{strings.CREATE_NEW_ACCOUNT}</Text>
            </CustomButton>
          </Animated.View>
        </View>
        <LanguageSelectorModal
          isModalVisible={isModalUserLangVisible}
          selectedLanguage={selectedLanguage}
          onDismiss={() => setModalUserLangVisible(false)}
          onLanguageChange={handleLanguageChange}
        />
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
    width: Math.min(width * 0.7, 400), // 30% of screen width, max 150
    height: Math.min(width * 0.7, 400),
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
    width: '90%',
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
    marginTop: 20,
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
  },
});

export default LoginScreen;
