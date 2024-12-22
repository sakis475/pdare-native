import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
  RefreshControl,
} from 'react-native';
import { Button, Divider, FAB, Text, Searchbar, TextInput } from 'react-native-paper';
import { getStorage, setStorage } from '../../storage/store';
import { colors } from '../../core/theme';
import { AlertWithOptions, emailValidator, toast } from '../../core/utils';
import { patchRequest, getRequest, postRequest, deleteRequest } from '../../helpers/requests';
import { LoadingOverlay } from '../../components/basic/SavingOverlay';
import {
  DoubleLeftIcon,
  DoubleRightIcon,
  SearchIcon,
  TrashIcon,
} from '../../components/basic/Icons';
import dayjs from '../../core/dayjs';
import { storageInitPersonelUsers } from '../../helpers/storage/storageInit';
import { useStrings } from '../../core/localization/languageContext';
import { EventEmitter, USERS_UPDATED } from '../../helpers/Sockets/EventEmitter';

interface SearchUserModalProps {
  visible: boolean;
  onDismiss: () => void;
  onInviteSuccess?: () => void; // Add this line
}

const SearchUserModal: React.FC<SearchUserModalProps> = ({
  visible,
  onDismiss,
  onInviteSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<(User & { isInvited: boolean }) | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();

  const strings = useStrings();

  useEffect(() => {
    if (visible) {
      // Reset all states when modal opens
      setSearchQuery('');
      setSearchResult(null);
      setIsSearching(false);

      // Clear any pending search timeout
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    }
  }, [visible]);

  const searchUsers = async (query: string) => {
    if (query.length < 3) {
      setSearchResult(null);
      return;
    }

    if (emailValidator(query, strings)) {
      return;
    }

    setIsSearching(true);
    try {
      const currentUser = await getStorage('currentUser');
      const result: User = await getRequest(`/user/search?email=${encodeURIComponent(query)}`);
      if (result) {
        const resultWithInviteState = {
          ...result,
          isInvited: !!result?.invitations?.find(
            (e) =>
              e.invitationStatus === 'awaiting' && e.restaurant?.id === currentUser.restaurant.id
          ),
        };
        setSearchResult(resultWithInviteState);
      } else {
        setSearchResult(null);
      }
    } catch (error) {
      console.error('Error searching user:', error);
      toast('error', strings.ERROR, strings.SEARCH_ERROR);
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query.trim());

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      searchUsers(query);
    }, 700);
  };

  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  const handleInvite = async (email: string) => {
    try {
      const invitationRequest = await postRequest('/user/invite', { email });
      if (!invitationRequest?.id) {
        onDismiss();
        return;
      }
      if (searchResult) {
        setSearchResult({
          ...searchResult,
          isInvited: true,
        });
      }
      toast('success', strings.SUCCESS, strings.INVITATION_SENT);
      if (onInviteSuccess) {
        onInviteSuccess(); // Call the callback to refresh the parent
      }
      onDismiss();
    } catch (error) {
      console.error('Error inviting user:', error);
      toast('error', strings.ERROR, strings.INVITATION_ERROR);
    }
  };

  const renderSearchResult = () => {
    // If no search has been performed yet, return nothing
    if (searchQuery.length === 0) {
      return null;
    }

    // If there's no search result after searching
    if (!searchResult && !isSearching) {
      return <Text style={styles.noResults}>{strings.NO_USERS_FOUND}</Text>;
    }

    if (searchResult) {
      return (
        <View style={styles.searchResultItem}>
          <View style={styles.userInfoContainer}>
            <View style={styles.textContainer}>
              <Text style={styles.searchResultEmail}>{searchResult.email}</Text>
              {searchResult.firstName && searchResult.lastName && (
                <Text style={styles.searchResultName}>
                  <Text>
                    {searchResult.firstName} {searchResult.lastName}
                  </Text>
                </Text>
              )}
            </View>
          </View>
          <Button
            mode="contained"
            onPress={() => handleInvite(searchResult.email)}
            disabled={searchResult.isInvited}
          >
            <Text style={{ color: colors.white }}>
              {searchResult.isInvited ? strings.INVITED : strings.INVITE}
            </Text>
          </Button>
        </View>
      );
    }

    return <Text style={styles.noResults}>{strings.SEARCHING}</Text>;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{strings.SEARCH_USER}</Text>

          <Searchbar
            placeholder={strings.SEARCH_BY_EMAIL}
            onChangeText={handleSearchChange}
            value={searchQuery}
            style={styles.searchBar}
          />

          {isSearching ? (
            <ActivityIndicator style={styles.searchLoading} color={colors.primary} />
          ) : (
            <View style={styles.searchResults}>{renderSearchResult()}</View>
          )}

          <View style={styles.buttonContainer}>
            <Button mode="outlined" onPress={onDismiss} style={styles.cancelButton}>
              {strings.CANCEL}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface EditUserModalProps {
  visible: boolean;
  user: User;
  onDismiss: () => void;
  onSave: (updatedUser: User) => void;
  onDelete?: (user: User) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  visible,
  user,
  onDismiss,
  onSave,
  onDelete,
}) => {
  const [role, setRole] = useState<'owner' | 'waiter' | 'guest'>(user?.role || 'guest');
  const [displayName, setDisplayName] = useState(user?.displayName || '');

  const strings = useStrings();

  useEffect(() => {
    setRole(user?.role || 'waiter');
    setDisplayName(user?.displayName || '');
  }, [user]);

  const handleSave = () => {
    const updatedUser: User = {
      ...user,
      role,
      displayName: displayName.trim(),
    };

    onSave(updatedUser);
    onDismiss();
  };

  const handleDelete = () => {
    if (!user || !onDelete) return;

    AlertWithOptions(
      strings.DELETE_CONFIRMATION,
      `${strings.DELETE_USER_CONFIRM} "${user.email}"${strings.QUESTION_MARK}`,
      () => {
        onDelete(user);
        onDismiss();
      },
      undefined,
      strings.DELETE
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{strings.UPDATE_USER}</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{strings.DISPLAY_NAME}</Text>
            <TextInput
              mode="outlined"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={strings.ENTER_DISPLAY_NAME}
              style={styles.input}
            />
          </View>

          <View style={styles.buttonContainer}>
            {onDelete && (
              <Button
                mode="outlined"
                onPress={handleDelete}
                style={[styles.deleteButton]}
                textColor={colors.lightRed}
              >
                <TrashIcon size={15} color={colors.lightRed} />
              </Button>
            )}

            <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
              {strings.SAVE}
            </Button>
          </View>
          <View style={styles.buttonContainer}>
            <Button mode="outlined" onPress={onDismiss} style={styles.cancelButton}>
              {strings.CANCEL}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AdminPersonelScreen = () => {
  const [users, setUsers] = useState<User[]>(null);
  const [invitations, setInvitations] = useState<InvitationRequest[]>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const strings = useStrings();

  const fetchData = async () => {
    const fetchedUsers: User[] = (await getStorage('personelUsers')) || [];
    const activeInvitations: InvitationRequest[] = (await getStorage('activeInvitations')) || [];

    setUsers(fetchedUsers);
    setInvitations(activeInvitations);
  };

  const fetchLiveData = async () => {
    await storageInitPersonelUsers();
    fetchData();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLiveData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();

    const subscription = EventEmitter.addListener(USERS_UPDATED, fetchData);
    return () => subscription.remove();
  }, []);

  const handleUserUpdate = async (updatedUser: User) => {
    setIsLoading(true);
    try {
      const response = await patchRequest('/user/admin', updatedUser);
      if (!Array.isArray(response)) {
        return;
      }
      await setStorage('personelUsers', response);
      setUsers(response);
      toast('success', strings.SUCCESS, strings.CHANGES_SAVED);
    } catch (error) {
      console.error('Error updating users:', error);
      toast('error', strings.ERROR, strings.SAVE_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (updatedUser: User) => {
    await handleUserUpdate(updatedUser);
  };

  const handleDelete = async (userToDelete: User) => {
    userToDelete.markForDelete = true;
    await handleUserUpdate(userToDelete);
  };

  const handleCancelInvitation = (invitation: InvitationRequest) => {
    AlertWithOptions(strings.DELETE_CONFIRMATION, strings.DELETE_INVITATION_CONFIRM, async () => {
      try {
        setIsLoading(true);
        await deleteRequest(`/user/invite/${invitation.id}`);
        setInvitations((prev) => prev.filter((inv) => inv.id !== invitation.id));
        toast('success', strings.SUCCESS, strings.INVITATION_DELETED);
      } catch (error) {
        console.error('Error deleting invitation:', error);
        toast('error', strings.ERROR, strings.DELETE_ERROR);
      } finally {
        setIsLoading(false);
      }
    });
  };

  const renderInvitationCard = (invitation: InvitationRequest) => (
    <View style={[styles.userCard, styles.invitationCard]}>
      <View style={styles.userInfo}>
        <Text style={styles.pendingLabel}>{strings.PENDING_INVITATION}</Text>
        <Text style={styles.userName}>{invitation.inviteTo.email}</Text>
        <Text style={styles.dateText}>
          {strings.SENT_ON} {dayjs(invitation.createdAt).format('DD/MM/YY HH:mm:ss')}
        </Text>
      </View>
      <Button
        mode="outlined"
        onPress={() => handleCancelInvitation(invitation)}
        style={styles.deleteButton}
        textColor={colors.lightRed}
      >
        <TrashIcon size={15} color={colors.lightRed} />
      </Button>
    </View>
  );

  const renderUserCard = ({ item }: { item: User | InvitationRequest }) => {
    // Check if item is an invitation by looking for invitationStatus property
    if ('invitationStatus' in item) {
      return renderInvitationCard(item as InvitationRequest);
    }

    const user = item as User;
    return (
      <TouchableOpacity
        style={styles.userCard}
        onPress={() => {
          setSelectedUser(user);
          setEditModalVisible(true);
        }}
      >
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.displayName}</Text>
          {user.firstName || user.lastName ? (
            <Text style={styles.userEmail}>
              {user.firstName} {user.lastName}
            </Text>
          ) : null}

          <Text style={styles.userName}>{user.email}</Text>
        </View>
        <View style={styles.roleTag}>
          <Text style={styles.roleText}>{user.role}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const combinedData = useMemo(() => {
    const pendingInvitations = Array.isArray(invitations) ? invitations : [];
    const currentUsers = Array.isArray(users) ? users : [];
    return [...pendingInvitations, ...currentUsers];
  }, [users, invitations]);

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{strings.NO_USERS_OR_INVITATIONS}</Text>
      <Text style={styles.emptyText}>{strings.SEARCH_TO_ADD}</Text>
    </View>
  );
  return (
    <View style={styles.container}>
      {users === null || invitations === null ? (
        <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
      ) : (
        <View style={styles.usersContainer}>
          <FlatList
            data={combinedData}
            renderItem={renderUserCard}
            keyExtractor={(item) => {
              if ('invitationStatus' in item) {
                return `invitation-${item.id}`;
              }
              return `user-${(item as User).email}`;
            }}
            ItemSeparatorComponent={Divider}
            style={styles.searchResults}
            contentContainerStyle={styles.searchResultsContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={ListEmptyComponent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          />
        </View>
      )}

      <FAB
        icon={() => <SearchIcon size={24} color={colors.white} />}
        style={styles.fab}
        onPress={() => setSearchModalVisible(true)}
        color={colors.darkGrey}
        animated={false}
      />

      {selectedUser && (
        <EditUserModal
          visible={editModalVisible}
          user={selectedUser}
          onDismiss={() => {
            setEditModalVisible(false);
            setSelectedUser(null);
          }}
          onSave={handleEditUser}
          onDelete={handleDelete}
        />
      )}

      <SearchUserModal
        visible={searchModalVisible}
        onDismiss={() => setSearchModalVisible(false)}
        onInviteSuccess={fetchLiveData}
      />

      {isLoading && <LoadingOverlay />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#2F2F2F',
  },
  usersContainer: {
    flex: 1,
    padding: 20,
  },
  userCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.grey,
    borderRadius: 8,
    marginVertical: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    gap: 4, // Adds spacing between text elements
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  userEmail: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
  },
  username: {
    fontSize: 14,
    color: colors.black,
    opacity: 0.8,
  },
  roleTag: {
    backgroundColor: colors.primary,
    padding: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  roleText: {
    color: colors.white,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: colors.white,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
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
    gap: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: colors.grey,
  },
  searchBar: {
    marginBottom: 20,
  },
  searchResults: {},
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginVertical: 4, // Add some vertical spacing between items
  },
  searchResultEmail: {
    color: colors.black,
  },
  searchLoading: {
    padding: 20,
  },
  noResults: {
    textAlign: 'center',
    padding: 20,
    color: colors.grey,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  roleButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  deleteButton: {
    borderColor: colors.lightRed,
    minWidth: 48,
    padding: 0,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 3,
  },
  searchResultName: {
    fontSize: 12,
    color: colors.grey,
    marginTop: 4,
    textAlign: 'center',
  },
  divider: {
    backgroundColor: colors.lightGrey,
  },
  searchResultsContent: {
    flexGrow: 1,
  },

  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  paginationButtonContainer: {
    flex: 1,
  },
  paginationText: {
    flex: 1,
    textAlign: 'center',
    color: colors.grey,
  },
  displayName: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    fontStyle: 'italic',
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
  invitationCard: {
    backgroundColor: colors.darkerGrey,
  },
  pendingLabel: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.7,
    marginTop: 4,
  },
  userInfoContainer: {
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center', // Center the text components
  },
});

export default AdminPersonelScreen;
