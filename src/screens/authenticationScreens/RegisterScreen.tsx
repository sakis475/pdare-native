import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text, TextInput, Button, Divider } from 'react-native-paper';
import { LongPressGestureHandler, ScrollView, State } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../core/theme';

const logoImage = require('../../../assets/mywaitericon.png');

const RegisterScreen: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const emailValidator = (email: string) => {
    if (!email) return 'Πρέπει να εισάγεται το Email σας';
    const re = /\S+@\S+\.\S+/;
    if (!re.test(email)) return 'Ουυπς.Το Email δεν είναι έγκυρο';
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

  const _onLoginPressed = () => {
    const emailError = emailValidator(email);
    const passwordError = passwordValidator(password);

    emailError ? setEmailError(emailError) : setEmailError('');
    passwordError ? setPasswordError(passwordError) : setPasswordError('');
    if (emailError || passwordError) {
      return;
    }

    // Handle login logic here
    console.log('Email:', email);
    console.log('Password:', password);
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

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <LongPressGestureHandler
          onHandlerStateChange={({ nativeEvent }) => {
            if (nativeEvent.state === State.ACTIVE) {
              handleLongPress();
            }
          }}
        >
          <Animated.Image source={logoImage} style={[styles.logo, animatedStyle]} />
        </LongPressGestureHandler>
        <View style={styles.titleContainer}>
          <Text style={styles.appTitle}>OrderPOS</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>
              Advanced Ordering App for Food and Beverages Services
            </Text>
          </View>
        </View>
      </View>
      <Divider style={styles.divider} />
      <View style={styles.formContainer}>
        <Text style={styles.header}>Δημιουργία Λογαριασμού</Text>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          persistentScrollbar={false}
          pinchGestureEnabled={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.fieldsContainer}>
            <View style={styles.fieldWrapper}>
              <TextInput
                label="Όνομα Χρήστη"
                value={userName}
                onChangeText={(text) => setUserName(text)}
                error={!!emailError}
                autoCapitalize="none"
                textContentType="emailAddress"
                style={styles.input}
                textColor={colors.white}
                underlineColor={colors.lighterGrey}
                activeUnderlineColor={colors.white}
              />
              {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
            </View>
            <View style={styles.fieldWrapper}>
              <TextInput
                label="Όνομα/Επώνυμο"
                value={userName}
                onChangeText={(text) => setUserName(text)}
                error={!!emailError}
                autoCapitalize="none"
                textContentType="emailAddress"
                style={styles.input}
                textColor={colors.white}
                underlineColor={colors.lighterGrey}
                activeUnderlineColor={colors.white}
              />
              {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
            </View>
            {/* Repeat other fields similarly */}
            <View style={styles.fieldWrapper}>
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
              />
              {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
            </View>
            <View style={styles.fieldWrapper}>
              <TextInput
                label="Κωδικός"
                value={password}
                onChangeText={(text) => setPassword(text)}
                error={!!passwordError}
                secureTextEntry={true}
                style={styles.input}
                textColor={colors.white}
                underlineColor={colors.lightGrey}
                activeUnderlineColor={colors.white}
              />
              {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
            </View>
            <View style={styles.fieldWrapper}>
              <TextInput
                label="Επαλήθευση Κωδικού"
                value={password}
                onChangeText={(text) => setPassword(text)}
                error={!!passwordError}
                secureTextEntry={true}
                style={styles.input}
                textColor={colors.white}
                underlineColor={colors.lightGrey}
                activeUnderlineColor={colors.white}
              />
              {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
            </View>
            <TouchableOpacity onPress={_onLoginPressed} style={styles.button}>
              <Text style={styles.text}>Εγγραφή</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: colors.lightBlack,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  titleContainer: {
    flexDirection: 'column',
  },
  subtitleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 12,
    width: 250,
    textAlign: 'center',
    color: colors.veryLighterGrey,
  },
  appTitle: {
    fontSize: 28,
    letterSpacing: 6,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 3,
    color: colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: colors.slightlyLighterGrey,
    marginVertical: 20,
  },
  formContainer: {
    backgroundColor: '#383838',
    paddingTop: 15,
    borderTopEndRadius: 10,
    borderTopStartRadius: 10,
    borderColor: colors.black,
    marginHorizontal: 20,
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingVertical: 14,
    textAlign: 'left',
    color: colors.white,
    marginHorizontal: 20,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  fieldsContainer: {
    gap: 15,
  },
  fieldWrapper: {
    marginBottom: 15, // Add bottom margin to space out fields
  },
  input: {
    backgroundColor: colors.darkerGrey,
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
  text: {
    fontSize: 16,
    color: colors.white,
  },
  error: {
    fontSize: 14,
    color: colors.lightRed,
    paddingVertical: 4,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 10,
  },
});

export default RegisterScreen;
