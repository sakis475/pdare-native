import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { colors } from '../../core/theme';

interface PropertyTypeBottomSheetProps {
  currentType: string;
  onTypeChange: (newType: string) => void;
}

const PropertyTypeBottomSheet = forwardRef<any, PropertyTypeBottomSheetProps>(
  ({ currentType, onTypeChange }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['30%', '30%'], []);

    const handleOpenModal = useCallback(() => {
      bottomSheetRef.current?.expand();
    }, []);

    const handleCloseModal = () => {
      bottomSheetRef.current?.close();
    };

    useImperativeHandle(ref, () => ({
      openModal: handleOpenModal,
      closeModal: handleCloseModal,
    }));

    const handleTypeSelection = (type: string) => {
      onTypeChange(type);
      handleCloseModal();
    };

    return (
      <Portal>
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={false}
          enableOverDrag={false}
          enableContentPanningGesture={false}
          backdropComponent={(backdropProps) => (
            <BottomSheetBackdrop
              {...backdropProps}
              enableTouchThrough={false}
              opacity={0.7}
              onPress={() => {
                handleCloseModal();
              }}
            />
          )}
          handleIndicatorStyle={{ backgroundColor: '#fff' }}
          backgroundStyle={{ backgroundColor: colors.darkGrey }}
        >
          <BottomSheetView style={styles.container}>
            <Text style={styles.title}>Αλλαγή Τύπου Επιλογής</Text>
            <Text style={styles.subtitle}>Τίτλος: {currentType}</Text>
            <TouchableOpacity
              style={[styles.button, currentType === 'singleselect' && styles.selectedButton]}
              onPress={() => handleTypeSelection('singleselect')}
            >
              <Text style={styles.buttonText}>Μονή</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, currentType === 'multiselect' && styles.selectedButton]}
              onPress={() => handleTypeSelection('multiselect')}
            >
              <Text style={styles.buttonText}>Πολλαπλή</Text>
            </TouchableOpacity>
          </BottomSheetView>
        </BottomSheet>
      </Portal>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.lighterGrey,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  selectedButton: {
    backgroundColor: colors.grey,
  },
  buttonText: {
    color: colors.white,
    fontSize: 13,
    textAlign: 'center',
  },
});

export default PropertyTypeBottomSheet;
