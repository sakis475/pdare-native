import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { Button, Divider, FAB, Text, Searchbar, TextInput } from 'react-native-paper';
import { getStorage, setStorage } from '../../storage/store';
import { colors } from '../../core/theme';
import { AlertWithOptions, toast } from '../../core/utils';
import { patchRequest, getRequest, postRequest } from '../../helpers/requests';
import { LoadingOverlay } from '../../components/basic/SavingOverlay';
import {
  DoubleLeftIcon,
  DoubleRightIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from '../../components/basic/Icons';

interface SearchUserModalProps {
  visible: boolean;
  onDismiss: () => void;
}

interface SearchResult {
  id: number;
  username: string;
  email: string;
  role: string;
  active: boolean;
  isInvited?: boolean;
}

interface PaginatedSearchResults {
  data: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const SearchUserModal: React.FC<SearchUserModalProps> = ({ visible, onDismiss }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const ITEMS_PER_PAGE = 5;

  const searchUsers = async (query: string, page: number = 1) => {
    if (query.length < 3) {
      setSearchResults([]);
      setTotalPages(0);
      setTotalResults(0);
      return;
    }

    setIsSearching(true);
    try {
      const response: PaginatedSearchResults = await getRequest(
        `/user/search?username=${encodeURIComponent(query)}&page=${page}&limit=${ITEMS_PER_PAGE}`
      );

      const resultsWithInviteState = response.data.map((result) => ({
        ...result,
        isInvited: false,
      }));

      setSearchResults(resultsWithInviteState);
      setTotalPages(response.totalPages);
      setTotalResults(response.total);
      setCurrentPage(response.page);
    } catch (error) {
      console.error('Error searching users:', error);
      toast('error', 'Σφάλμα', 'Παρουσιάστηκε σφάλμα κατά την αναζήτηση');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    searchUsers(searchQuery, newPage);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        <View style={styles.paginationButtonContainer}>
          {currentPage > 1 && (
            <Button mode="text" onPress={() => handlePageChange(currentPage - 1)}>
              <DoubleLeftIcon color={colors.black} />
            </Button>
          )}
        </View>

        <Text style={styles.paginationText}>
          Page {currentPage} of {totalPages}
        </Text>

        <View style={styles.paginationButtonContainer}>
          {currentPage < totalPages && (
            <Button mode="text" onPress={() => handlePageChange(currentPage + 1)}>
              <DoubleRightIcon color={colors.black} />
            </Button>
          )}
        </View>
      </View>
    );
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on new search

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      searchUsers(query, 1);
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
      await postRequest('/user/invite', { email });
      setSearchResults(
        searchResults.map((result) =>
          result.email === email ? { ...result, isInvited: true } : result
        )
      );
      toast('success', 'Επιτυχία', 'Η πρόσκληση στάλθηκε επιτυχώς');
    } catch (error) {
      console.error('Error inviting user:', error);
      toast('error', 'Σφάλμα', 'Παρουσιάστηκε σφάλμα κατά την αποστολή της πρόσκλησης');
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: SearchResult }) => (
      <View style={styles.searchResultItem}>
        <View>
          <Text style={styles.searchResultEmail}>{item.email}</Text>
          <Text style={styles.searchResultName}>@{item.username}</Text>
        </View>
        <Button mode="contained" onPress={() => handleInvite(item.email)} disabled={item.isInvited}>
          {item.isInvited ? 'Προσκλήθηκε' : 'Πρόσκληση'}
        </Button>
      </View>
    ),
    []
  );

  const keyExtractor = useCallback((item: SearchResult) => item.email, []);

  const ListEmptyComponent = useCallback(
    () =>
      searchQuery.length >= 3 && !isSearching ? (
        <Text style={styles.noResults}>Δεν βρέθηκαν χρήστες</Text>
      ) : null,
    [searchQuery, isSearching]
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Αναζήτηση Χρήστη</Text>

          <Searchbar
            placeholder="Αναζήτηση με email"
            onChangeText={handleSearchChange}
            value={searchQuery}
            style={styles.searchBar}
          />

          {isSearching ? (
            <ActivityIndicator style={styles.searchLoading} color={colors.primary} />
          ) : (
            <>
              <FlatList
                data={searchResults}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ItemSeparatorComponent={Divider}
                ListEmptyComponent={ListEmptyComponent}
                style={styles.searchResults}
                contentContainerStyle={styles.searchResultsContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              />
              {renderPagination()}
            </>
          )}

          <View style={styles.buttonContainer}>
            <Button mode="outlined" onPress={onDismiss} style={styles.cancelButton}>
              Ακύρωση
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
  onDelete?: (email: string) => void;
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

  useEffect(() => {
    setRole(user?.role || 'guest');
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
      'Επιβεβαίωση Διαγραφής',
      `Είστε σίγουροι ότι θέλετε να διαγράψετε τον χρήστη "${user.username}";`,
      () => {
        onDelete(user.email);
        onDismiss();
      },
      undefined,
      'Διαγραφή'
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Ενημέρωση Χρήστη</Text>
          <Text style={styles.username}>@{user?.username}</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Εμφανιζόμενο Όνομα</Text>
            <TextInput
              mode="outlined"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Εισάγετε εμφανιζόμενο όνομα"
              style={styles.input}
            />
          </View>

          <View style={styles.roleContainer}>
            {(['owner', 'waiter', 'guest'] as const).map((roleOption) => (
              <Button
                key={roleOption}
                mode={role === roleOption ? 'contained' : 'outlined'}
                onPress={() => setRole(roleOption)}
                style={styles.roleButton}
              >
                {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
              </Button>
            ))}
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
              Αποθήκευση
            </Button>
          </View>
          <View style={styles.buttonContainer}>
            <Button mode="outlined" onPress={onDismiss} style={styles.cancelButton}>
              Ακύρωση
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AdminPersonelScreen = () => {
  const [users, setUsers] = useState<User[]>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    const fetchedUsers: User[] = (await getStorage('personelUsers')) || [];
    setUsers(fetchedUsers);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserUpdate = async (updatedUsers: User[]) => {
    setIsLoading(true);
    try {
      const response = await patchRequest('/user/save', updatedUsers);
      if (!Array.isArray(response)) {
        return;
      }
      await setStorage('personelUsers', response);
      setUsers(response);
      toast('success', 'Επιτυχία', 'Οι αλλαγές αποθηκεύτηκαν επιτυχώς');
    } catch (error) {
      console.error('Error updating users:', error);
      toast('error', 'Σφάλμα', 'Παρουσιάστηκε σφάλμα κατά την αποθήκευση');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = async (updatedUser: User) => {
    const newUsers = users.map((user) => (user.email === updatedUser.email ? updatedUser : user));
    await handleUserUpdate(newUsers);
  };

  const handleDelete = async (email: string) => {
    const newUsers = users.filter((user) => user.email !== email);
    await handleUserUpdate(newUsers);
  };

  const renderUserCard: ListRenderItem<User> = ({ item: user }) => {
    return (
      <TouchableOpacity
        style={styles.userCard}
        onPress={() => {
          setSelectedUser(user);
          setEditModalVisible(true);
        }}
      >
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.userEmail}>{user.displayName}</Text>
          <Text style={styles.username}>{user.username}</Text>
        </View>
        <View style={styles.roleTag}>
          <Text style={styles.roleText}>{user.role}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const ListEmptyComponent = () => <Text style={styles.noResults}>Δεν βρέθηκαν χρήστες</Text>;

  return (
    <View style={styles.container}>
      {users?.length > 0 ? (
        <View style={styles.usersContainer}>
          <FlatList
            data={users}
            renderItem={renderUserCard}
            keyExtractor={(user: User) => user.email}
            ItemSeparatorComponent={Divider}
            ListEmptyComponent={ListEmptyComponent}
            style={styles.searchResults}
            contentContainerStyle={styles.searchResultsContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : users === null ? (
        <ActivityIndicator size={'large'} animating={true} color={colors.primary} />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Δεν υπάρχουν χρήστες.</Text>
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
    color: colors.white,
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
    flex: 1,
    marginRight: 10,
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
});

export default AdminPersonelScreen;
