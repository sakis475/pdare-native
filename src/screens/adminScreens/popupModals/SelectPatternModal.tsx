import { Modal, FlatList, TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { colors } from '../../../core/theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ActivityIndicator, Button } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { toast } from '../../../core/utils';
import { getItemPropertyPatterns } from '../../../helpers/storage/orderStorage';
import { useNavigation } from '@react-navigation/native';
import { navigate, ScreenNames } from '../../../navigation/AppNavigator';

interface SelectPatternModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (pattern: PropertyPattern) => void;
}

export const SelectPatternModal: React.FC<SelectPatternModalProps> = ({
  visible,
  onDismiss,
  onSelect,
}) => {
  const navigation = useNavigation();

  const [patterns, setPatterns] = useState<PropertyPattern[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadPatterns();
    }
  }, [visible]);

  const loadPatterns = async () => {
    setLoading(true);
    try {
      const fetchedPatterns = (await getItemPropertyPatterns()) || [];
      setPatterns(fetchedPatterns);
    } catch (error) {
      console.error('Error loading patterns:', error);
      toast('error', 'Error', 'Failed to load patterns');
    } finally {
      setLoading(false);
    }
  };

  const renderPattern = ({ item }: { item: PropertyPattern }) => (
    <TouchableOpacity
      style={styles.patternItem}
      onPress={() => {
        onSelect(item);
        onDismiss();
      }}
    >
      <Text style={styles.patternTitle}>{item.propertyPatternTitle}</Text>
      <Text style={styles.patternCount}>
        {new Set(item.itemProperties.map((prop) => prop.propertyName)).size} properties
      </Text>
    </TouchableOpacity>
  );

  const handleCreatePattern = () => {
    onDismiss();
    navigate(ScreenNames.ManageItemDetailsPatternScreen);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Επιλογή Μοτίβου</Text>
            <TouchableOpacity onPress={onDismiss}>
              <MaterialIcons name="close" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              <FlatList
                data={patterns}
                renderItem={renderPattern}
                keyExtractor={(item) => item.id?.toString() || item.propertyPatternTitle}
                contentContainerStyle={styles.patternList}
                ListEmptyComponent={<Text style={styles.emptyText}>No patterns available</Text>}
              />

              <View style={styles.footer}>
                <Button
                  mode="contained"
                  onPress={handleCreatePattern}
                  style={styles.createButton}
                  icon="plus"
                >
                  Δημιουργία Νέου Μοτίβου
                </Button>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.darkGrey,
    borderRadius: 8,
    overflow: 'hidden',
    paddingBottom: 0, // Remove bottom padding to accommodate footer
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  patternList: {
    padding: 16,
    paddingBottom: 0, // Remove bottom padding to avoid double padding with footer
  },
  patternItem: {
    padding: 16,
    backgroundColor: colors.grey,
    borderRadius: 8,
    marginBottom: 8,
  },
  patternTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  patternCount: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.7,
    marginTop: 4,
  },
  emptyText: {
    color: colors.white,
    textAlign: 'center',
    padding: 16,
  },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grey,
    backgroundColor: colors.darkGrey,
  },

  createButton: {
    marginBottom: 0,
    backgroundColor: colors.primary,
  },
});
