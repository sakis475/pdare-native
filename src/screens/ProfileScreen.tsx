import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { getStorage, setStorage } from '../storage/store';
import { colors } from '../core/theme';
import { TrashIcon, WarningIcon } from '../components/basic/Icons';
import CustomTextInput from '../components/basic/CustomTextInput';
import { emailValidator, passwordValidator } from '../core/utils';
import { deleteRequest, patchRequest, setBearer } from '../helpers/requests';
import { SessionBearer } from '../types/requests.types';
import { logout } from '../helpers/storage/tokenRequests';

const ProfileScreen = ({ route }: any) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
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

  const updateFormField = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updatePasswordField = (field: string) => (value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    console.log(passwordData);
  }, [passwordData]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setIsInitializing(true);
        const currentUser = await getStorage('currentUser');
        if (!currentUser) return;

        setUser(currentUser);
        setFormData({
          username: currentUser.username || '',
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
          email: currentUser.email || '',
          restaurantName: currentUser.restaurant?.restaurantName || '',
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        Alert.alert('Error', 'Failed to load user data');
      } finally {
        setIsInitializing(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleUpdateProfile = async () => {
    const { username, firstName, lastName, email } = formData;

    if (!username.trim()) {
      Alert.alert('Error', `Username can't be empty`);
      return;
    }

    if (emailValidator(email)) {
      Alert.alert('Error', emailValidator(email));
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
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordValidator(newPassword)) {
      Alert.alert('Error', passwordValidator(newPassword));
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
      Alert.alert('Success', 'Password updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRestaurantName = async () => {
    if (!formData.restaurantName.trim()) {
      Alert.alert('Error', 'Please enter a restaurant name');
      return;
    }

    setIsLoading(true);
    try {
      const response = await patchRequest('/user/restaurant/update', {
        restaurantDisplayName: formData.restaurantName.trim(),
      });
      if (response) {
        Alert.alert('Success', 'Restaurant Display Name updated successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update restaurant name');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent. Are you sure you want your account to be deleted?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await deleteRequest('/user/delete');
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteRestaurant = () => {
    Alert.alert(
      'Delete Restaurant',
      'Are you sure you want to delete this restaurant? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await postRequest('/user/restaurant/delete');
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete restaurant');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleLeaveRestaurant = () => {
    Alert.alert('Leave Restaurant', 'Are you sure you want to leave this restaurant?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          setIsLoading(true);
          try {
            // await leaveRestaurant();
            // await logout();
          } catch (error) {
            Alert.alert('Error', 'Failed to leave restaurant');
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
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
          <Text style={styles.buttonText}>Delete Restaurant</Text>
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
            <Text style={styles.sectionTitle}>Profile Information</Text>
            <CustomTextInput
              label="Username"
              value={formData.username}
              onChangeText={updateFormField('username')}
            />
            <CustomTextInput
              label="First Name"
              value={formData.firstName}
              onChangeText={updateFormField('firstName')}
              autoCapitalize="words"
            />
            <CustomTextInput
              label="Last Name"
              value={formData.lastName}
              onChangeText={updateFormField('lastName')}
              autoCapitalize="words"
            />
            <CustomTextInput
              label="Email"
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
              Update Profile
            </Button>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            <CustomTextInput
              label="Current Password"
              value={passwordData.currentPassword}
              onChangeText={updatePasswordField('currentPassword')}
              secureTextEntry
            />
            <CustomTextInput
              label="New Password"
              value={passwordData.newPassword}
              onChangeText={updatePasswordField('newPassword')}
              secureTextEntry
            />
            <CustomTextInput
              label="Confirm New Password"
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
              Update Password
            </Button>
          </View>

          {user.role === 'owner' && user.restaurant && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Restaurant Settings</Text>
              <CustomTextInput
                label="Restaurant Name"
                value={formData.restaurantName}
                onChangeText={updateFormField('restaurantName')}
              />
              <Button
                mode="contained"
                onPress={handleUpdateRestaurantName}
                loading={isLoading}
                style={styles.button}
              >
                Update Restaurant Name
              </Button>
              {DeleteRestaurantButton}
            </View>
          )}

          {user.role === 'waiter' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Restaurant Settings</Text>
              <Text style={styles.restaurantText}>
                Είστε μέλος στο:{' '}
                <Text style={styles.restaurantName}>{user.restaurant.restaurantName}</Text>
              </Text>
              <Button
                mode="outlined"
                onPress={handleLeaveRestaurant}
                loading={isLoading}
                style={[styles.button, styles.leaveButton]}
                textColor={colors.lightRed}
              >
                Leave Restaurant
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
              Διαγραφή Λογαριασμού
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
});

export default ProfileScreen;
