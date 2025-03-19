import React, { useCallback, useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TextInput, Keyboard, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../../core/theme';
import { useStrings } from '../../core/localization/languageContext';
import CustomButton from '../../components/basic/CustomButton';
import { getStorage } from '../../storage/store';
import { User } from '../../types/basic.types';
import { postRequest, refreshToken } from '../../helpers/requests';
import { toast } from '../../core/utils';
import { navigate, navigateReset, ScreenNames } from '../../navigation/navigationUtils';
import { LogoutFAB } from '../../components/LogoutFab';
import { InfoIcon } from '../../components/basic/Icons';
import { handleUserLogin } from '../../helpers/storage/tokenRequests';
import { SessionBearer } from '../../types/requests.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OTP_LENGTH = 6;
const RESEND_THRESHOLD = 240; // 4 minutes in seconds

const VerifyEmailScreen = () => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [otpExists, setOtpExists] = useState<boolean>(false);

  const strings = useStrings();
  const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));
  const [user, setUser] = useState<User>(null);

  const initVerify = async () => {
    try {
      setIsLoading(true);
      const currentUser = await getStorage('currentUser');
      setUser(currentUser);

      // Check if OTP already exists
      const remainingTime = await checkOtpExists();

      if (remainingTime > 0) {
        // OTP exists, set timer
        setOtpExists(true);
        setTimerSeconds(remainingTime);
        setCanResend(remainingTime < RESEND_THRESHOLD);
      } else {
        // No OTP exists
        setOtpExists(false);
        setCanResend(true);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (otp: string) => {
    const response = await postRequest('/user/verifyOTP', { otp });
    return response;
  };

  const createOtp = async () => {
    const response = await postRequest('/user/createOTP');
    console.log(response.ttl, 'user/createOTP');
    return response.ttl;
  };

  const checkOtpExists = async () => {
    const response = await postRequest('/user/existsOTP');
    console.log(response.ttl, 'user/existsOTP');
    return response.ttl;
  };

  useEffect(() => {
    initVerify();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prevTimer) => {
          const newTime = prevTimer - 1;

          // Enable resend when under threshold (but only if not resending)
          if (newTime < RESEND_THRESHOLD && !isResending) {
            setCanResend(true);
          }

          return newTime;
        });
      }, 1000);
    } else {
      setOtpExists(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerSeconds, isResending]); // Add isResending to dependency array

  useEffect(() => {
    if (otp?.[5]) {
      handleSubmit();
    }
  }, [otp]);

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
        const response: SessionBearer = await verifyOtp(otpString);

        if (response) {
          handleUserLogin(response);
        }
        // Navigation to next screen would happen here
      }
    } catch (error) {
      setError(strings.OTP_VERIFICATION_FAILED);
    } finally {
      setIsSubmitting(false);
    }
  }, [otp, user?.email, validateOtp, isSubmitting, strings]);

  const handleResendOtp = useCallback(async () => {
    if (!canResend) return;

    try {
      setCanResend(false);
      setIsResending(true);
      const ttl = await createOtp();
      setTimerSeconds(ttl);
      setOtp(Array(OTP_LENGTH).fill(''));
      setError('');
      setOtpExists(true);
      toast('success', strings.RESENDED_EMAIL);
    } catch (error) {
      setError(strings.OTP_RESEND_FAILED);
      setCanResend(true);
    } finally {
      setIsResending(false);
    }
  }, [canResend, isResending, strings]);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
      </View>
    );
  }

  // Welcome/Instructions screen (no OTP exists yet)
  if (!otpExists) {
    return (
      <View style={styles.container}>
        <View style={styles.mainContent}>
          <Text style={styles.header}>{strings.VERIFY_EMAIL}</Text>

          <Text style={styles.instructionText}>
            {strings.OTP_INITIAL_INSTRUCTION.replace('{email}', user?.email || '')}
          </Text>

          <CustomButton loading={isResending} onPress={handleResendOtp}>
            <Text style={styles.buttonText}>{strings.SEND_EMAIL}</Text>
          </CustomButton>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
        <LogoutFAB variant="upperRightSmall" />
      </View>
    );
  }

  // OTP Verification screen (OTP exists)
  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <Text style={styles.header}>{strings.VERIFY_EMAIL}</Text>
        <Text style={styles.instructionText}>
          {strings.OTP_INSTRUCTION.replace('{email}', user?.email || '')}
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
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            width: '70%',
          }}
        >
          <InfoIcon size={18}></InfoIcon>
          <Text style={styles.spamInfo}>{strings.CHECK_YOUR_SPAM_FOLDER}</Text>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.resendContainer}>
          {canResend ? (
            <CustomButton onPress={handleResendOtp} mode="outlined">
              <Text style={[styles.resendLink, isResending && styles.disabled]}>
                {isResending ? strings.RESENDING_OTP : strings.RESEND_EMAIL}
              </Text>
            </CustomButton>
          ) : (
            <CustomButton
              onPress={() => {
                if (isSubmitting) {
                  return;
                }
                const timeUntilResendAvailable =
                  timerSeconds > RESEND_THRESHOLD ? timerSeconds - RESEND_THRESHOLD : 0;
                if (timeUntilResendAvailable > 0) {
                  toast(
                    'info',
                    strings.RESEND_EMAIL_TIMER.replace('{seconds}', `${timeUntilResendAvailable}`)
                  );
                } else {
                  handleResendOtp();
                }
              }}
              debounce={1.5}
              disabled={isSubmitting}
            >
              <Text style={styles.timerText}>{strings.RESEND_EMAIL}</Text>
            </CustomButton>
          )}
        </View>
        <View style={styles.timerInfoContainer}>
          <Text style={styles.timerInfo}>
            {strings.OTP_EXPIRY_INFO.replace('{seconds}', formatTimeRemaining(timerSeconds))}
          </Text>
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <CustomButton loading={isSubmitting} onPress={handleSubmit}>
          <Text style={styles.buttonText}>{strings.VERIFY}</Text>
        </CustomButton>
      </View>
      <LogoutFAB variant="upperRightSmall" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBlack,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.lightBlack,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: colors.white,
    fontSize: 16,
  },
  timerText: {
    color: colors.white,
    fontSize: 16,
  },
  timerInfoContainer: {
    marginTop: 15,
  },
  timerInfo: {
    color: colors.white,
    fontSize: 14,
    opacity: 0.7,
  },
  spamInfo: {
    justifyContent: 'center',
    textAlign: 'center',
    color: colors.white,
    fontSize: 12,
  },
  bottomContainer: {
    backgroundColor: colors.darkerGrey,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default VerifyEmailScreen;
