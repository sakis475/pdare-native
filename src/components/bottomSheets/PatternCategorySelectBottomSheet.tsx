import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, List } from 'react-native-paper';
import { getStorage } from '../../storage/store';
import { colors } from '../../core/theme';
import { FlatList } from 'react-native-gesture-handler';

interface CategoryBottomSheetProps {
  currentCategory?: Category | null;
  onCategoryChange: (category: Category) => void;
  onClose?: () => void; // Add this prop
}

interface CategoryBottomSheetRef {
  openModal: () => void;
  closeModal: () => void;
}

export const CategoryBottomSheet = forwardRef<CategoryBottomSheetRef, CategoryBottomSheetProps>(
  ({ currentCategory, onCategoryChange, onClose }, ref) => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    // Variables
    const snapPoints = useMemo(() => ['55%', '55%'], []);

    // Callbacks
    const handlePresentModalPress = useCallback(() => {
      bottomSheetModalRef.current?.present();
    }, []);

    const handleDismissModalPress = useCallback(() => {
      bottomSheetModalRef.current?.dismiss();
    }, []);

    useImperativeHandle(ref, () => ({
      openModal: handlePresentModalPress,
      closeModal: handleDismissModalPress,
    }));

    useEffect(() => {
      loadCategories();
    }, []);

    const loadCategories = async () => {
      try {
        const fetchedCategories = (await getStorage('categories')) || [];
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    const handleSelect = (category: Category) => {
      onCategoryChange(category);
      handleDismissModalPress();
    };

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      ),
      []
    );

    const renderItem = ({ item: category }: { item: Category }) => (
      <TouchableOpacity style={styles.categoryItem} onPress={() => handleSelect(category)}>
        <View style={styles.categoryRow}>
          <Text style={styles.categoryTitle}>{category.title}</Text>
        </View>
      </TouchableOpacity>
    );
    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        enableDismissOnClose={true}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.darkGrey }}
        handleStyle={{ zIndex: 99999 }}
        style={{
          zIndex: 99999,
        }}
        onDismiss={onClose}
        handleIndicatorStyle={{ backgroundColor: '#fff' }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Επιλογή Κατηγορίας Προτύπου</Text>
        </View>

        <FlatList
          data={categories}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          bounces={false}
          showsVerticalScrollIndicator={true}
        />
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey,
    backgroundColor: colors.darkGrey,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  listContent: {
    paddingBottom: 20,
  },
  categoryItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.darkGrey,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: colors.grey,
    opacity: 0.3,
  },
});
