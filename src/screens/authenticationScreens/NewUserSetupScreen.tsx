import React, { useState } from 'react';
import { View, StyleSheet, Modal, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Button, Text, TextInput, FAB } from 'react-native-paper';
import { postRequest } from '../../helpers/requests';
import { colors } from '../../core/theme';
import { TrashIcon } from '../../components/basic/Icons';
import { toast } from '../../core/utils';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { handleUserLogin, logout } from '../../helpers/storage/tokenRequests';
import { SessionBearer } from '../../types/requests.types';
import { clearRestaurantStorageRelatedKeys, getStorage } from '../../storage/store';

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
          <Button
            mode="contained"
            onPress={() => setSelectedOption('join')}
            style={styles.optionButton}
          >
            Σύνδεση με Εστιατόριο
          </Button>
        </View>
      );
    }

    if (selectedOption === 'join') {
      return (
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingText}>
            Δεν έχετε λάβει ακόμη πρόσκληση από κάποιο εστιατόριο.
          </Text>
          <Button mode="outlined" onPress={() => setSelectedOption(null)} style={styles.backButton}>
            Επιστροφή
          </Button>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {renderContent()}
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
      <LogoutFAB />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2F2F2F',
    padding: 20,
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
});

export default NewUserSetupScreen;
