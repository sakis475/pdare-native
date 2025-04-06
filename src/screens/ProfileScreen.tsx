import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { RadioButton, Text } from 'react-native-paper';
import { getStorage, setStorage } from '../storage/store';
import { colors } from '../core/theme';
import { WarningIcon } from '../components/basic/Icons';
import CustomTextInput from '../components/basic/CustomTextInput';
import { AlertWithOptions, emailValidator, passwordValidator, toast } from '../core/utils';
import { deleteRequest, patchRequest, postRequest, setBearer } from '../helpers/requests';
import { SessionBearer } from '../types/requests.types';
import { handleUserLogin, logout } from '../helpers/storage/tokenRequests';
import { AppLanguage, setLocalizedStrings } from '../core/localization/strings';
import { EventEmitter } from '../helpers/Sockets/EventEmitter';
import { useStrings } from '../core/localization/languageContext';
import { useNavigation } from '@react-navigation/native';
import CustomNavigationScreenHeaderTitle from '../components/basic/CustomNavigationScreenHeaderTitle';
import { LoadingOverlay } from '../components/basic/SavingOverlay';
import CustomNumberInput from '../components/basic/CustomNumberInput';
import CustomButton from '../components/basic/CustomButton';
import LanguageSelectorModal, {
  languageOptions,
} from '../components/popupModals/LanguageSelectorModal';
import { TouchableOpacity } from 'react-native-gesture-handler';

const ProfileScreen = ({ route }: any) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isModalUserLangVisible, setModalUserLangVisible] = useState(false);
  const [isModalRestLangVisible, setModalRestLangVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>('lang_el');

  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    restaurantName: '',
    displayName: '',
    couvertCost: 0,
    currencySymbol: '€',
    restaurantLanguage: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

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
            restaurantName: currentUser?.restaurant?.restaurantName || '',
            displayName: currentUser.displayName || '',
            couvertCost: currentUser?.restaurant?.couvertCost || 0,
            currencySymbol: currentUser?.restaurant?.currencySymbol || '',
            restaurantLanguage:
              currentUser?.restaurant.restaurantLanguage || savedLanguage || 'lang_en',
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
    const { username, firstName, lastName, email, displayName } = formData;

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
        displayName: displayName.trim(),
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

  const handleUpdateRestaurant = async () => {
    if (!formData.restaurantName.trim()) {
      toast('error', strings.RESTAURANT_NAME_EMPTY);
      return;
    }

    setIsLoading(true);
    try {
      const response = await patchRequest('/user/restaurant/update', {
        restaurantDisplayName: formData.restaurantName.trim(),
        currencySymbol: formData.currencySymbol.trim(),
        couvertCost: formData.couvertCost,
        restaurantLanguage: formData.restaurantLanguage.trim(),
      });
      if (response) {
        await setStorage('currentUser', response.user);
        await setBearer(response);
        toast('success', strings.PROFILE_UPDATE_SUCCESS);
      }
    } catch (error) {
      toast('error', strings.PROFILE_UPDATE_SUCCESS);
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
          const response: SessionBearer = await deleteRequest('/user/restaurant/delete');

          await logout({ skipNavigate: true });
          await setStorage('currentUser', response.user);
          await handleUserLogin(response);
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
          const response: SessionBearer = await deleteRequest('/user/restaurant/leaveRestaurant');
          await logout({ skipNavigate: true });
          await setStorage('currentUser', response.user);
          await handleUserLogin(response);
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
      <CustomButton
        mode="outlined"
        onPress={handleDeleteRestaurant}
        loading={isLoading}
        variant="warning"
      >
        {strings.DELETE_RESTAURANT}
      </CustomButton>
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
            <CustomButton
              onPress={() => setModalUserLangVisible(true)}
              style={{ backgroundColor: colors.purpleIris }}
            >
              <Text style={{ color: colors.white, textAlign: 'center' }}>
                {languageOptions.find((e) => e.value === selectedLanguage).label}
              </Text>
            </CustomButton>
            <LanguageSelectorModal
              isModalVisible={isModalUserLangVisible}
              selectedLanguage={selectedLanguage}
              onDismiss={() => setModalUserLangVisible(false)}
              onLanguageChange={handleLanguageChange}
            />
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
            {user.role === 'owner' && (
              <CustomTextInput
                label={strings.DISPLAY_NAME}
                value={formData.displayName}
                onChangeText={updateFormField('displayName')}
                autoCapitalize="words"
              />
            )}
            <CustomButton mode="contained" onPress={handleUpdateProfile} loading={isLoading}>
              {strings.UPDATE_PROFILE}
            </CustomButton>
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
            <CustomButton mode="contained" onPress={handleUpdatePassword} loading={isLoading}>
              {strings.UPDATE_PASSWORD}
            </CustomButton>
          </View>

          {user.role === 'owner' && user.restaurant && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{strings.RESTAURANT_SETTINGS}</Text>
              <CustomTextInput
                label={strings.RESTAURANT_NAME}
                value={formData.restaurantName}
                onChangeText={updateFormField('restaurantName')}
              />
              <CustomTextInput
                label={strings.CURRENCY_SYMBOL}
                value={`${formData.currencySymbol}`}
                onChangeText={updateFormField('currencySymbol')}
              />
              <CustomNumberInput
                label={strings.COUVERT_COST}
                value={formData.couvertCost}
                onChangeText={updateFormField('couvertCost')}
                allowDecimals={true}
                showButtons={true}
                step={0.1}
                max={1000}
              />

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{strings.LANGUAGE_SETTINGS}</Text>

                <CustomButton
                  onPress={() => setModalRestLangVisible(true)}
                  style={{ backgroundColor: colors.purpleIris }}
                >
                  <Text style={{ color: colors.white, textAlign: 'center' }}>
                    {languageOptions.find((e) => e.value === formData.restaurantLanguage).label}
                  </Text>
                </CustomButton>
                <LanguageSelectorModal
                  isModalVisible={isModalRestLangVisible}
                  selectedLanguage={formData.restaurantLanguage}
                  onDismiss={() => setModalRestLangVisible(false)}
                  onLanguageChange={(lang) => updateFormField('restaurantLanguage')(lang)}
                />
              </View>

              <CustomButton mode="contained" onPress={handleUpdateRestaurant} loading={isLoading}>
                {strings.UPDATE}
              </CustomButton>
            </View>
          )}

          {user.role === 'waiter' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{strings.RESTAURANT_SETTINGS}</Text>
              <Text style={styles.restaurantText}>
                {strings.YOU_ARE_MEMBER_OF}{' '}
                <Text style={styles.restaurantName}>{user.restaurant.restaurantName}</Text>
              </Text>
              <CustomButton
                mode="outlined"
                onPress={handleLeaveRestaurant}
                loading={isLoading}
                variant="delete"
              >
                {strings.LEAVE_RESTAURANT}
              </CustomButton>
            </View>
          )}

          <View style={styles.section}>
            <CustomButton
              mode="contained"
              onPress={handleDeleteAccount}
              loading={isLoading}
              variant="delete"
            >
              {strings.DELETE_ACCOUNT_BUTTON}
            </CustomButton>
            {user.role === 'owner' && DeleteRestaurantButton}
          </View>
        </View>
      </ScrollView>
      {isLoading && <LoadingOverlay />}
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
