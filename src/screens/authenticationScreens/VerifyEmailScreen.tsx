import React, { useCallback, useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TextInput, Keyboard, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../../core/theme';
import { useStrings } from '../../core/localization/languageContext';
import CustomButton from '../../components/basic/CustomButton';
import { getStorage } from '../../storage/store';
import { User } from '../../types/basic.types';
import { getRequest, postRequest } from '../../helpers/requests';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OTP_LENGTH = 6;

const VerifyEmailScreen = () => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [canResend, setCanResend] = useState<boolean>(false);

  const strings = useStrings();
  const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));
  const [user, setUser] = useState<User>(null);

  const initVerify = async () => {
    const currentUser = await getStorage('currentUser');
    setUser(currentUser);
    await createInitialOtp();
  };

  const createInitialOtp = async () => {
    try {
      setIsResending(true);
      const ttl = await resendOtp();
      setTimerSeconds(ttl);
      setCanResend(false);
    } catch (error) {
      setError(strings.OTP_CREATION_FAILED);
    } finally {
      setIsResending(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {};

  const resendOtp = async () => {
    const response = await postRequest('/user/createOTP');
    return response.ttl;
  };

  useEffect(() => {
    initVerify();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerSeconds > 0 && !canResend) {
      interval = setInterval(() => {
        setTimerSeconds((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setCanResend(true);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerSeconds, canResend]);

  const formatTimeRemaining = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  const handleOtpChange = useCallback(
    (text: string, index: number) => {
      if (text.length > 1) {
        // Handle paste operation
        const pastedText = text.split('').slice(0, OTP_LENGTH);
        const newOtp = [...otp];

        pastedText.forEach((char, charIndex) => {
          if (index + charIndex < OTP_LENGTH) {
            newOtp[index + charIndex] = char;
          }
        });

        setOtp(newOtp);

        // Focus the next field after the pasted content
        const nextIndex = Math.min(index + pastedText.length, OTP_LENGTH - 1);
        inputRefs.current[nextIndex]?.focus();
      } else {
        // Handle single character input
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Auto-focus to next input if current input is filled
        if (text && index < OTP_LENGTH - 1) {
          inputRefs.current[index + 1]?.focus();
        }
      }

      setError('');
    },
    [otp]
  );

  const handleKeyPress = useCallback(
    (e: any, index: number) => {
      // Handle backspace - move to previous input
      if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  const validateOtp = useCallback((): boolean => {
    const otpString = otp.join('');
    if (otpString.length !== OTP_LENGTH) {
      setError(strings.OTP_INCOMPLETE);
      return false;
    }

    if (!/^\d+$/.test(otpString)) {
      setError(strings.OTP_DIGITS_ONLY);
      return false;
    }

    return true;
  }, [otp, strings]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    Keyboard.dismiss();
    setIsSubmitting(true);

    try {
      const isValid = validateOtp();

      if (isValid) {
        const otpString = otp.join('');
        await verifyOtp(user?.email, otpString);
        // Navigation to next screen would happen here
      }
    } catch (error) {
      setError(strings.OTP_VERIFICATION_FAILED);
    } finally {
      setIsSubmitting(false);
    }
  }, [otp, user?.email, validateOtp, isSubmitting, strings]);

  const handleResendOtp = useCallback(async () => {
    if (!canResend || isResending) return;

    setIsResending(true);

    try {
      const ttl = await resendOtp();
      setCanResend(false);
      setTimerSeconds(ttl);
      setOtp(Array(OTP_LENGTH).fill(''));
      setError('');
    } catch (error) {
      setError(strings.OTP_RESEND_FAILED);
    } finally {
      setIsResending(false);
    }
  }, [canResend, isResending, strings]);

  return (
    <View style={styles.container}>
      {user?.email ? (
        <>
          <View style={styles.mainContent}>
            <Text style={styles.header}>{strings.VERIFY_EMAIL}</Text>

            <Text style={styles.instructionText}>
              {strings.OTP_INSTRUCTION.replace('{email}', user.email)}
            </Text>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={styles.otpInput}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={OTP_LENGTH}
                  selectTextOnFocus
                  autoFocus={index === 0}
                />
              ))}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.resendContainer}>
              {canResend ? (
                <Text style={styles.resendLink} onPress={handleResendOtp}>
                  {isResending ? strings.RESENDING_OTP : strings.RESEND_OTP}
                </Text>
              ) : (
                <Text style={styles.timerText}>
                  {strings.RESEND_OTP_TIMER.replace('{seconds}', formatTimeRemaining(timerSeconds))}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.bottomContainer}>
            <CustomButton loading={isSubmitting} onPress={handleSubmit}>
              <Text style={styles.buttonText}>{strings.VERIFY}</Text>
            </CustomButton>
          </View>
        </>
      ) : (
        <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBlack,
    justifyContent: 'center',
  },
  mainContent: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 20,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 30,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  otpInput: {
    width: (SCREEN_WIDTH - 100) / OTP_LENGTH,
    height: 60,
    borderWidth: 1,
    borderColor: colors.slightlyLighterGrey,
    borderRadius: 8,
    backgroundColor: colors.darkerGrey,
    color: colors.white,
    fontSize: 24,
    textAlign: 'center',
  },
  error: {
    fontSize: 14,
    color: colors.lightRed,
    marginTop: 10,
    textAlign: 'center',
  },
  resendContainer: {
    marginTop: 30,
  },
  resendLink: {
    color: colors.primary,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  timerText: {
    color: colors.white,
    fontSize: 16,
  },
  bottomContainer: {
    backgroundColor: colors.darkerGrey,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: colors.slightlyLighterGrey,
  },
  buttonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
});

export default VerifyEmailScreen;
