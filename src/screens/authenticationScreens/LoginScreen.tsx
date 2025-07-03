import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
  Image,
  Keyboard,
} from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../../core/theme';
import { login, logout, resetPassword } from '../../helpers/storage/tokenRequests';
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
import PasswordResetModal from '../../components/popupModals/PasswordResetModal';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const logoImage = require('../../../assets/servetablogowhite.png');

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isModalUserLangVisible, setModalUserLangVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>('lang_el');
  const [isModalPasswordResetVisible, setModalPasswordResetVisible] = useState(false);

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

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    handleGetLastCredentials();
    handleGetCurrentLanguage();
    logout({ skipNavigate: true });

    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => {
      console.log('he');
      scrollRef.current?.scrollTo({ y: 1000, animated: true });
    });

    return () => keyboardDidShow.remove();
  }, []);

  useEffect(() => {
    setEmailError('');
    setPasswordError('');
  }, [email, password]);

  const _onLoginPressed = async () => {
    const emailErr = emailValidator(email);
    const passErr = passwordValidator(password);

    setEmailError(emailErr);
    setPasswordError(passErr);

    if (emailErr || passErr) return;

    setIsLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePressRegister = () => {
    navigate(ScreenNames.RegisterScreen);
  };

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
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => setModalUserLangVisible(true)}
            style={styles.languageButton}
          >
            <LanguageIcon size={16} />
            <Text style={styles.languageText}>
              {languageOptions.find((e) => e.value === selectedLanguage)?.label}
            </Text>
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image source={logoImage} style={[styles.logo]} />
            <Text style={styles.appDescription}>{strings.APP_DESCRIPTION}</Text>
          </View>

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
                />
                {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
              </View>

              <View style={styles.inputWrapper}>
                <CustomTextInput
                  label={strings.PASSWORD}
                  value={password}
                  onChangeText={setPassword}
                  error={!!passwordError}
                  secureTextEntry
                  disabled={isLoading}
                />
                {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
              </View>
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              disabled={isLoading}
              onPress={() => setModalPasswordResetVisible(true)}
            >
              <Text style={styles.forgotPasswordText}>{strings.RESET_PASSWORD}</Text>
            </TouchableOpacity>

            <CustomButton onPress={_onLoginPressed} loading={isLoading}>
              <Text style={styles.buttonText}>{strings.LOGIN}</Text>
            </CustomButton>

            <CustomButton onPress={handlePressRegister} loading={isLoading} mode="outlined">
              <Text style={styles.buttonText}>{strings.CREATE_NEW_ACCOUNT}</Text>
            </CustomButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LanguageSelectorModal
        isModalVisible={isModalUserLangVisible}
        selectedLanguage={selectedLanguage}
        onDismiss={() => setModalUserLangVisible(false)}
        onLanguageChange={handleLanguageChange}
      />

      <PasswordResetModal
        isModalVisible={isModalPasswordResetVisible}
        onDismiss={() => setModalPasswordResetVisible(false)}
        onConfirm={async () => {
          setModalPasswordResetVisible(false);
          await resetPassword(email);
        }}
      />
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
    paddingHorizontal: width * 0.05,
  },
  scrollContent: {
    paddingHorizontal: width * 0.05,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: height * 0.05,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: height * 0.02,
  },
  appDescription: {
    width: '90%',
    textAlign: 'center',
    color: colors.veryLighterGrey,
    fontSize: Math.min(width * 0.04, 16),
  },
  languageButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    borderColor: colors.lighterGrey,
    borderWidth: 1,
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  languageText: {
    color: colors.white,
    fontSize: 12,
  },
  formContainer: {
    backgroundColor: '#383838',
    padding: width * 0.05,
    borderRadius: 10,
    borderColor: colors.black,
  },
  header: {
    fontSize: Math.min(width * 0.06, 20),
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
  buttonText: {
    fontSize: Math.min(width * 0.04, 16),
    color: colors.white,
    textAlign: 'center',
  },
  error: {
    fontSize: Math.min(width * 0.035, 14),
    color: colors.lightRed,
    paddingVertical: 4,
  },
});

export default LoginScreen;
