import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Button, Text, TextInput, FAB, IconButton } from 'react-native-paper';
import { getRequest, postRequest } from '../../helpers/requests';
import { colors } from '../../core/theme';
import { TrashIcon } from '../../components/basic/Icons';
import { toast } from '../../core/utils';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { handleUserLogin, logout } from '../../helpers/storage/tokenRequests';
import { SessionBearer } from '../../types/requests.types';
import { clearRestaurantStorageRelatedKeys, getStorage } from '../../storage/store';
import { LoadingOverlay } from '../../components/basic/SavingOverlay';
import { LogoutFAB } from '../../components/LogoutFab';
import { useStrings } from '../../core/localization/languageContext';

const NewUserSetupScreen = () => {
  const [selectedOption, setSelectedOption] = useState<'join' | 'create' | null>(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(undefined);

  const strings = useStrings();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchData();
      toast('success', strings.SUCCESS);
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast('error', strings.ERROR);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchData = async () => {
    const fetchUserWithInvitations: User = await getRequest('/user/invite');

    if (!fetchUserWithInvitations?.id) {
      return;
    }

    setCurrentUser(fetchUserWithInvitations);
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRestaurant = async () => {
    if (!restaurantName.trim()) {
      toast('error', strings.ERROR, strings.ENTER_RESTAURANT_NAME);
      return;
    }

    setIsLoading(true);
    try {
      const sessionBearer: SessionBearer = await postRequest('/user/restaurant/create', {
        restaurantName: restaurantName.trim(),
      });
      if (!sessionBearer?.user?.restaurant) {
        throw Error('No restaurant Created Error');
      }
      await clearRestaurantStorageRelatedKeys();
      const userLogin = await handleUserLogin(sessionBearer);
      if (userLogin) {
        console.log(restaurantName, 'restaurantName');
        toast('success', strings.SUCCESS, strings.RESTAURANT_CREATED);
      }
      // Navigate to next screen or refresh app state here
    } catch (error) {
      console.error('Error creating restaurant:', error);
      toast('error', strings.ERROR, strings.CREATION_ERROR);
    } finally {
      setIsLoading(false);
      setCreateModalVisible(false);
    }
  };

  const renderContent = () => {
    if (!selectedOption) {
      return (
        <View style={styles.optionsContainer}>
          <Text style={styles.welcomeText}>{strings.WELCOME_MESSAGE}</Text>
          <Button
            mode="contained"
            onPress={() => {
              setSelectedOption('create');
              setCreateModalVisible(true);
            }}
            style={styles.optionButton}
          >
            {strings.CREATE_RESTAURANT}
          </Button>
          <View style={styles.buttonWithBadge}>
            <Button
              mode="contained"
              onPress={() => setSelectedOption('join')}
              style={styles.optionButton}
            >
              {strings.JOIN_RESTAURANT}
            </Button>
            {currentUser?.invitations?.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{currentUser.invitations.length}</Text>
              </View>
            )}
          </View>

          <LogoutFAB />
        </View>
      );
    }

    if (selectedOption === 'join') {
      const renderInvitationItem = ({ item: invitation }: { item: InvitationRequest }) => (
        <View style={styles.invitationCard}>
          <View style={styles.invitationInfo}>
            <Text style={styles.restaurantName}>{invitation.restaurant.restaurantName}</Text>
            <Text style={styles.inviteFrom}>
              {strings.FROM} {invitation.inviteFrom.email}
            </Text>
          </View>

          <View style={styles.invitationActions}>
            <Button
              mode="contained"
              onPress={async () => {
                setIsLoading(true);
                try {
                  const sessionBearer: SessionBearer = await postRequest(
                    `/user/invite/response/${invitation.id}`,
                    { response: true }
                  );
                  if (sessionBearer?.user?.restaurant) {
                    await clearRestaurantStorageRelatedKeys();
                    const userLogin = await handleUserLogin(sessionBearer);
                    if (userLogin) {
                      toast('success', strings.SUCCESS, strings.JOINED_SUCCESS);
                    }
                  }
                } catch (error) {
                  console.error('Error accepting invitation:', error);
                  toast('error', strings.ERROR, strings.ACCEPT_ERROR);
                } finally {
                  setIsLoading(false);
                }
              }}
              style={styles.acceptButton}
            >
              {strings.ACCEPT}
            </Button>

            <Button
              mode="outlined"
              onPress={async () => {
                setIsLoading(true);
                try {
                  await postRequest(`/user/invite/response/${invitation.id}`, { response: false });
                  await fetchData();
                  toast('success', strings.SUCCESS, strings.INVITATION_DENIED);
                } catch (error) {
                  console.error('Error denying invitation:', error);
                  toast('error', strings.ERROR, strings.DENY_ERROR);
                } finally {
                  setIsLoading(false);
                }
              }}
              style={styles.denyButton}
              textColor={colors.lightRed}
            >
              {strings.DENY}
            </Button>
          </View>
        </View>
      );

      if (currentUser?.invitations?.length > 0) {
        return (
          <View style={styles.invitationsContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.invitationsTitle}>{strings.RESTAURANT_INVITATIONS}</Text>
            </View>

            <FlatList
              data={currentUser.invitations}
              renderItem={renderInvitationItem}
              keyExtractor={(item) => item.id?.toString()}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl
                  refreshing={isLoading || isRefreshing}
                  onRefresh={handleRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
            />

            <Button
              mode="outlined"
              onPress={() => setSelectedOption(null)}
              style={styles.backButton}
              textColor={colors.white}
            >
              {strings.BACK}
            </Button>
          </View>
        );
      }

      return (
        <View style={styles.waitingContainer}>
          <IconButton
            icon="refresh"
            iconColor={colors.white}
            size={24}
            onPress={handleRefresh}
            loading={isRefreshing}
            style={styles.refreshButton}
          />
          <Text style={styles.waitingText}>{strings.NO_INVITATIONS}</Text>
          <Button mode="outlined" onPress={() => setSelectedOption(null)} style={styles.backButton}>
            {strings.BACK}
          </Button>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {currentUser === undefined ? (
        <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
      ) : (
        renderContent()
      )}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{strings.CREATE_RESTAURANT}</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{strings.RESTAURANT_NAME}</Text>
              <TextInput
                mode="outlined"
                value={restaurantName}
                onChangeText={setRestaurantName}
                placeholder={strings.ENTER_RESTAURANT_NAME_PLACEHOLDER}
                style={styles.input}
                returnKeyType="done"
                blurOnSubmit={false}
                onSubmitEditing={() => {}}
                keyboardType="default"
              />
            </View>

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => {
                  setCreateModalVisible(false);
                  setSelectedOption(null);
                  setRestaurantName(''); // Clear the restaurant name on cancel
                }}
                style={styles.cancelButton}
              >
                {strings.CANCEL}
              </Button>
              <Button
                mode="contained"
                onPress={handleCreateRestaurant}
                style={styles.saveButton}
                loading={isLoading}
                disabled={isLoading}
              >
                {strings.CREATE}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2F2F2F',
    padding: 20,
    justifyContent: 'center',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 30,
  },
  optionButton: {
    width: '100%',
    maxWidth: 300,
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  waitingText: {
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
    marginBottom: 30,
  },
  backButton: {
    width: 200,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: colors.grey,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  fab: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.slightlyDarkerGrey,
    borderColor: colors.slightlyLighterGrey,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  fabText: {
    color: colors.white,
    fontSize: 12,
    marginTop: 2,
  },
  invitationsContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  invitationCard: {
    backgroundColor: colors.grey,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  invitationInfo: {
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  inviteFrom: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
  },
  invitationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    flex: 1,
    maxWidth: 120,
  },
  denyButton: {
    flex: 1,
    maxWidth: 120,
    borderColor: colors.lightRed,
  },
  listContainer: {
    flexGrow: 1,
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.white,
    fontSize: 16,
    opacity: 0.8,
  },
  buttonWithBadge: {
    position: 'relative',
    width: '100%',
    maxWidth: 300,
  },
  badge: {
    position: 'absolute',
    right: -10,
    top: -10,
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  refreshButton: {},
  invitationsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
});

export default NewUserSetupScreen;
