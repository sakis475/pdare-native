import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, ActivityIndicator, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { Button, Text, TextInput, FAB } from 'react-native-paper';
import { getRequest, postRequest } from '../../helpers/requests';
import { colors } from '../../core/theme';
import { TrashIcon } from '../../components/basic/Icons';
import { toast } from '../../core/utils';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { handleUserLogin, logout } from '../../helpers/storage/tokenRequests';
import { SessionBearer } from '../../types/requests.types';
import { clearRestaurantStorageRelatedKeys, getStorage } from '../../storage/store';
import { LoadingOverlay } from '../../components/basic/SavingOverlay';

const LogoutFAB: React.FC = () => {
  return (
    <TouchableOpacity style={styles.fabContainer} onPress={logout}>
      <View style={styles.fab}>
        <MaterialIcons name="logout" size={24} color={colors.white} />
        <Text style={styles.fabText}>Logout</Text>
      </View>
    </TouchableOpacity>
  );
};

const NewUserSetupScreen = () => {
  const [selectedOption, setSelectedOption] = useState<'join' | 'create' | null>(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(undefined);

  const fetchData = async () => {
    const fetchUserWithInvitations: User = await getRequest('/user/invite');

    if (!fetchUserWithInvitations.id) {
      return;
    }

    setCurrentUser(fetchUserWithInvitations);
  }
  useEffect(() => {
    fetchData();
  }, [])

  const handleCreateRestaurant = async () => {
    if (!restaurantName.trim()) {
      toast('error', 'Σφάλμα', 'Παρακαλώ εισάγετε όνομα εστιατορίου');
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
        toast('success', 'Επιτυχία', 'Το εστιατόριο δημιουργήθηκε επιτυχώς');
      }
      // Navigate to next screen or refresh app state here
    } catch (error) {
      console.error('Error creating restaurant:', error);
      toast('error', 'Σφάλμα', 'Παρουσιάστηκε σφάλμα κατά τη δημιουργία του εστιατορίου');
    } finally {
      setIsLoading(false);
      setCreateModalVisible(false);
    }
  };

  const renderContent = () => {
    if (!selectedOption) {
      return (
        <View style={styles.optionsContainer}>
          <Text style={styles.welcomeText}>Καλώς ήρθατε! Τι θα θέλατε να κάνετε;</Text>
          <Button
            mode="contained"
            onPress={() => {
              setSelectedOption('create');
              setCreateModalVisible(true);
            }}
            style={styles.optionButton}
          >
            Δημιουργία Εστιατορίου
          </Button>
          <View style={styles.buttonWithBadge}>
            <Button
              mode="contained"
              onPress={() => setSelectedOption('join')}
              style={styles.optionButton}
            >
              Σύνδεση με Εστιατόριο
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
            <Text style={styles.restaurantName}>
              {invitation.restaurant.restaurantName}
            </Text>
            <Text style={styles.inviteFrom}>
              Από: {invitation.inviteFrom.email}
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
                      toast('success', 'Επιτυχία', 'Συνδεθήκατε με το κατάστημα.');
                    }
                  }
                } catch (error) {
                  console.error('Error accepting invitation:', error);
                  toast('error', 'Σφάλμα', 'Παρουσιάστηκε σφάλμα κατά την αποδοχή της πρόσκλησης');
                } finally {
                  setIsLoading(false);
                }
              }}
              style={styles.acceptButton}
            >
              Αποδοχή
            </Button>

            <Button
              mode="outlined"
              onPress={async () => {
                setIsLoading(true);
                try {
                  await postRequest(
                    `/user/invite/response/${invitation.id}`,
                    { response: false }
                  );
                  await fetchData();
                  toast('success', 'Επιτυχία', 'Η πρόσκληση απορρίφθηκε');
                } catch (error) {
                  console.error('Error denying invitation:', error);
                  toast('error', 'Σφάλμα', 'Παρουσιάστηκε σφάλμα κατά την απόρριψη της πρόσκλησης');
                } finally {
                  setIsLoading(false);
                }
              }}
              style={styles.denyButton}
              textColor={colors.lightRed}
            >
              Απόρριψη
            </Button>
          </View>
        </View>
      );

      if (currentUser?.invitations?.length > 0) {
        return (
          <View style={styles.invitationsContainer}>
            <Text style={styles.invitationsTitle}>Προσκλήσεις σε Εστιατόρια</Text>

            <FlatList
              data={currentUser.invitations}
              renderItem={renderInvitationItem}
              keyExtractor={(item) => item.id?.toString()}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl
                  refreshing={isLoading}
                  onRefresh={fetchData}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
              ListEmptyComponent={() => (
                <Text style={styles.emptyText}>
                  Δεν έχετε λάβει ακόμη πρόσκληση από κάποιο εστιατόριο.
                </Text>
              )}
            />

            <Button
              mode="outlined"
              onPress={() => setSelectedOption(null)}
              style={styles.backButton}
              textColor={colors.white}
            >
              Επιστροφή
            </Button>
          </View>
        );
      }

      return (
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingText}>
            Δεν έχετε λάβει ακόμη πρόσκληση από κάποιο εστιατόριο.
          </Text>
          <Button
            mode="outlined"
            onPress={() => setSelectedOption(null)}
            style={styles.backButton}
          >
            Επιστροφή
          </Button>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {currentUser === undefined ? <ActivityIndicator size={'large'} animating={true} color={colors.primary} /> : renderContent()}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Δημιουργία Εστιατορίου</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Όνομα Εστιατορίου</Text>
              <TextInput
                mode="outlined"
                value={restaurantName}
                onChangeText={setRestaurantName}
                placeholder="Εισάγετε όνομα εστιατορίου"
                style={styles.input}
                returnKeyType="done"
                blurOnSubmit={false}
                onSubmitEditing={() => { }}
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
                Ακύρωση
              </Button>
              <Button
                mode="contained"
                onPress={handleCreateRestaurant}
                style={styles.saveButton}
                loading={isLoading}
                disabled={isLoading}
              >
                Δημιουργία
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
    justifyContent: 'center'
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
    justifyContent: 'center'
  },
  invitationsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 20,
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
});

export default NewUserSetupScreen;
