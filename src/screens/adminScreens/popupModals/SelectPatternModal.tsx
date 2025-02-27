import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { colors } from '../../../core/theme';
import { ActivityIndicator, Button } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { toast } from '../../../core/utils';
import { getItemPropertyPatterns } from '../../../helpers/storage/orderStorage';
import { useNavigation } from '@react-navigation/native';
import { navigate, ScreenNames } from '../../../navigation/navigationUtils';
import { useStrings } from '../../../core/localization/languageContext';
import BaseModal from '../../../components/basic/BaseModal';
import { FlashList } from '@shopify/flash-list';
import { Category, PropertyPattern } from '../../../types/basic.types';
import CustomButton from '../../../components/basic/CustomButton';

interface SelectPatternModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (pattern: PropertyPattern) => void;
  category: Category;
}

export const SelectPatternModal: React.FC<SelectPatternModalProps> = ({
  visible,
  onDismiss,
  onSelect,
  category,
}) => {
  const navigation = useNavigation();

  const [patterns, setPatterns] = useState<PropertyPattern[]>([]);
  const [loading, setLoading] = useState(false);
  const strings = useStrings();

  useEffect(() => {
    if (visible) {
      loadPatterns();
    }
  }, [visible]);

  const loadPatterns = async () => {
    setLoading(true);
    try {
      const fetchedPatterns = (await getItemPropertyPatterns()) || [];
      const categoryPattern = fetchedPatterns.filter((e) => e.category.id === category.id);
      setPatterns(categoryPattern);
    } catch (error) {
      console.error('Error loading patterns:', error);
      toast('error', strings.ERROR, strings.FAILED_TO_LOAD_PATTERNS);
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
        {new Set(item.itemProperties.map((prop) => prop.propertyName)).size} {strings.PROPERTIES}
      </Text>
    </TouchableOpacity>
  );

  const handleCreatePattern = () => {
    onDismiss();
    navigate(ScreenNames.ManageItemDetailsPatternScreen);
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onDismiss}
      onConfirm={handleCreatePattern}
      testID="select-pattern-edit-modal"
      showButtons={false}
      title={strings.SELECT_PATTERN}
      theme="dark"
    >
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <>
          <FlashList
            data={patterns}
            renderItem={renderPattern}
            keyExtractor={(item) => item.id?.toString() || item.propertyPatternTitle}
            contentContainerStyle={styles.patternList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>{strings.NO_PATTERNS_AVAILABLE}</Text>
            }
            estimatedItemSize={10}
          />

          <View style={styles.footer}>
            <CustomButton
              mode="contained"
              onPress={handleCreatePattern}
              style={styles.createButton}
            >
              <Text style={{ color: colors.white }}> {strings.CREATE_NEW_PATTERN}</Text>
            </CustomButton>
          </View>
        </>
      )}
    </BaseModal>
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
  },

  createButton: {
    marginBottom: 0,
    backgroundColor: colors.primary,
  },
});
