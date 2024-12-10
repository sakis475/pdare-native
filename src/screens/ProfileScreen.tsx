import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Button, RadioButton, Text } from 'react-native-paper';
import { getStorage, setStorage } from '../storage/store';
import { colors } from '../core/theme';
import { WarningIcon } from '../components/basic/Icons';
import CustomTextInput from '../components/basic/CustomTextInput';
import { AlertWithOptions, emailValidator, passwordValidator, toast } from '../core/utils';
import { deleteRequest, patchRequest, postRequest, setBearer } from '../helpers/requests';
import { SessionBearer } from '../types/requests.types';
import { logout } from '../helpers/storage/tokenRequests';
import { AppLanguage, setLocalizedStrings } from '../core/localization/strings';
import { EventEmitter } from '../helpers/Sockets/EventEmitter';
import { useStrings } from '../core/localization/languageContext';
import { useNavigation } from '@react-navigation/native';
import CustomNavigationScreenHeaderTitle from '../components/basic/CustomNavigationScreenHeaderTitle';

const ProfileScreen = ({ route }: any) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>('lang_el');
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    restaurantName: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const languageOptions: { id: number; value: AppLanguage; label: string }[] = [
    { id: 1, value: 'lang_en', label: 'English' },
    { id: 2, value: 'lang_el', label: 'Ελληνικά' },
  ];

  const strings = useStrings();
  const navigation = useNavigation();

  const updateFormField = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updatePasswordField = (field: string) => (value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setIsInitializing(true);
        const currentUser = await getStorage('currentUser');
        const savedLanguage = await getStorage('app_language');

        if (currentUser) {
          setUser(currentUser);
          setFormData({
            username: currentUser.username || '',
            firstName: currentUser.firstName || '',
            lastName: currentUser.lastName || '',
            email: currentUser.email || '',
            restaurantName: currentUser.restaurant?.restaurantName || '',
          });
        }

        if (savedLanguage) {
          setSelectedLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        toast('error', strings.ERROR, strings.ERROR_FAILED_TO_LOAD_USER_DATA);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleLanguageChange = useCallback(
    async (language: AppLanguage) => {
      try {
        await setStorage('app_language', language);
        await setLocalizedStrings();
        setSelectedLanguage(language);
        // Emit language change event if you're using event system
        EventEmitter.emit('LANGUAGE_CHANGED');
        toast('success', strings.SUCCESS, strings.LANGUAGE_UPDATED);
      } catch (error) {
        toast('error', strings.ERROR);
      }
    },
    [strings]
  );

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => <CustomNavigationScreenHeaderTitle title={strings.PROFILE} bold={true} />,
    });
  }, [strings]);

  const handleUpdateProfile = async () => {
    const { username, firstName, lastName, email } = formData;

    if (!username.trim()) {
      toast('error', strings.ERROR, strings.ERROR_USERNAME_EMPTY);
      return;
    }

    if (emailValidator(email, strings)) {
      toast('error', strings.ERROR, emailValidator(email, strings));
      return;
    }

    setIsLoading(true);
    try {
      const response: SessionBearer = await patchRequest('/user', {
        username: username.trim(),
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        email: email.trim().toLowerCase(),
      });

      // Update local storage with new user data
      await setStorage('currentUser', response.user);
      await setBearer(response);

      toast('success', strings.SUCCESS, strings.PROFILE_UPDATE_SUCCESS);
    } catch (error) {
      toast('error', strings.ERROR, strings.PROFILE_UPDATE_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast('error', strings.ERROR, strings.ERROR_FILL_ALL_PASSWORD_FIELDS);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast('error', strings.ERROR, strings.PASSWORDS_DO_NOT_MATCH);
      return;
    }

    if (passwordValidator(newPassword, strings)) {
      toast('error', passwordValidator(newPassword, strings));
      return;
    }

    setIsLoading(true);
    try {
      console.log(newPassword, 'handleupadtehanasnd');
      const response: SessionBearer = await patchRequest('/user/password', {
        currentPassword,
        newPassword: newPassword,
      });

      // Update local storage with new user data
      await setStorage('currentUser', response.user);
      await setBearer(response);

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast('success', strings.SUCCESS, strings.PASSWORD_UPDATE_SUCCESS);
    } catch (error) {
      toast('error', strings.ERROR, strings.PASSWORD_UPDATE_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRestaurantName = async () => {
    if (!formData.restaurantName.trim()) {
      toast('error', strings.RESTAURANT_NAME_EMPTY);
      return;
    }

    setIsLoading(true);
    try {
      const response = await patchRequest('/user/restaurant/update', {
        restaurantDisplayName: formData.restaurantName.trim(),
      });
      if (response) {
        toast('success', strings.RESTAURANT_NAME_UPDATE_SUCCESS);
      }
    } catch (error) {
      toast('error', strings.RESTAURANT_NAME_UPDATE_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    AlertWithOptions(
      strings.DELETE_ACCOUNT,
      strings.DELETE_ACCOUNT_CONFIRM,
      async () => {
        setIsLoading(true);
        try {
          await deleteRequest('/user/delete');
          await logout();
        } catch (error) {
          toast('error', strings.DELETE_ACCOUNT_FAILED);
        } finally {
          setIsLoading(false);
        }
      },
      () => {}
    );
  };

  const handleDeleteRestaurant = () => {
    AlertWithOptions(
      strings.DELETE_RESTAURANT,
      strings.DELETE_RESTAURANT_CONFIRM,
      async () => {
        setIsLoading(true);
        try {
          await postRequest('/user/restaurant/delete');
          await logout();
        } catch (error) {
          toast('error', strings.DELETE_RESTAURANT_FAILED);
        } finally {
          setIsLoading(false);
        }
      },
      () => {}
    );
  };

  const handleLeaveRestaurant = () => {
    AlertWithOptions(
      strings.LEAVE_RESTAURANT,
      strings.LEAVE_RESTAURANT_CONFIRM,
      async () => {
        setIsLoading(true);
        try {
          // await leaveRestaurant();
          // await logout();
        } catch (error) {
          toast('error', 'Failed to leave restaurant');
        } finally {
          setIsLoading(false);
        }
      },
      () => {}
    );
  };

  const DeleteRestaurantButton = useMemo(
    () => (
      <Button
        mode="outlined"
        onPress={handleDeleteRestaurant}
        loading={isLoading}
        style={[styles.button, styles.deleteButton]}
        textColor={colors.lightRed}
      >
        <View style={styles.buttonInner}>
          <WarningIcon size={20} color={colors.veryLighterRed} />
          <Text style={styles.buttonText}>{strings.DELETE_RESTAURANT}</Text>
          <WarningIcon size={20} color={colors.veryLighterRed} />
        </View>
      </Button>
    ),
    [isLoading]
  );

  if (isInitializing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user?.id) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{strings.LANGUAGE_SETTINGS}</Text>

            {languageOptions.map((option) => (
              <View key={option.id} style={styles.languageOption}>
                <RadioButton.Android
                  value={option.value}
                  status={selectedLanguage === option.value ? 'checked' : 'unchecked'}
                  color={colors.primary}
                  uncheckedColor={colors.white}
                  onPress={() => {
                    handleLanguageChange(option.value);
                  }}
                />
                <Text style={styles.languageLabel}>{option.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{strings.PROFILE_INFORMATION}</Text>
            <CustomTextInput
              label={strings.FIRST_NAME}
              value={formData.firstName}
              onChangeText={updateFormField('firstName')}
              autoCapitalize="words"
            />
            <CustomTextInput
              label={strings.LAST_NAME}
              value={formData.lastName}
              onChangeText={updateFormField('lastName')}
              autoCapitalize="words"
            />
            <CustomTextInput
              label={strings.EMAIL}
              value={formData.email}
              onChangeText={updateFormField('email')}
              keyboardType="email-address"
            />
            <Button
              mode="contained"
              onPress={handleUpdateProfile}
              loading={isLoading}
              style={styles.button}
            >
              {strings.UPDATE_PROFILE}
            </Button>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{strings.CHANGE_PASSWORD}</Text>
            <CustomTextInput
              label={strings.CURRENT_PASSWORD}
              value={passwordData.currentPassword}
              onChangeText={updatePasswordField('currentPassword')}
              secureTextEntry
            />
            <CustomTextInput
              label={strings.NEW_PASSWORD}
              value={passwordData.newPassword}
              onChangeText={updatePasswordField('newPassword')}
              secureTextEntry
            />
            <CustomTextInput
              label={strings.CONFIRM_NEW_PASSWORD}
              value={passwordData.confirmPassword}
              onChangeText={updatePasswordField('confirmPassword')}
              secureTextEntry
            />
            <Button
              mode="contained"
              onPress={handleUpdatePassword}
              loading={isLoading}
              style={styles.button}
            >
              {strings.UPDATE_PASSWORD}
            </Button>
          </View>

          {user.role === 'owner' && user.restaurant && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{strings.RESTAURANT_SETTINGS}</Text>
              <CustomTextInput
                label={strings.RESTAURANT_NAME}
                value={formData.restaurantName}
                onChangeText={updateFormField('restaurantName')}
              />
              <Button
                mode="contained"
                onPress={handleUpdateRestaurantName}
                loading={isLoading}
                style={styles.button}
              >
                {strings.UPDATE_RESTAURANT_NAME}
              </Button>
              {DeleteRestaurantButton}
            </View>
          )}

          {user.role === 'waiter' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{strings.RESTAURANT_SETTINGS}</Text>
              <Text style={styles.restaurantText}>
                {strings.YOU_ARE_MEMBER_OF}{' '}
                <Text style={styles.restaurantName}>{user.restaurant.restaurantName}</Text>
              </Text>
              <Button
                mode="outlined"
                onPress={handleLeaveRestaurant}
                loading={isLoading}
                style={[styles.button, styles.leaveButton]}
                textColor={colors.lightRed}
              >
                {strings.LEAVE_RESTAURANT}
              </Button>
            </View>
          )}

          <View style={styles.section}>
            <Button
              mode="contained"
              onPress={handleDeleteAccount}
              loading={isLoading}
              style={[styles.button, styles.deleteAccountButton]}
              textColor={colors.white}
            >
              {strings.DELETE_ACCOUNT_BUTTON}
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkGrey,
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  section: {
    backgroundColor: colors.grey,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.slightlyLighterGrey,
    gap: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.white,
  },
  button: {
    marginTop: 8,
    alignItems: 'center',
  },
  deleteButton: {
    borderColor: colors.lightRed,
    marginTop: 16,
  },
  leaveButton: {
    borderColor: colors.lightRed,
  },
  deleteAccountButton: {
    backgroundColor: colors.lightRed,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: colors.lightRed,
    fontSize: 16,
  },
  restaurantText: {
    color: colors.white,
  },
  restaurantName: {
    color: colors.white,
    fontWeight: 'bold',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.slightlyLighterGrey,
    borderRadius: 8,
    marginVertical: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  languageLabel: {
    color: colors.white,
    fontSize: 16,
    marginLeft: 8,
  },
});

export default ProfileScreen;
