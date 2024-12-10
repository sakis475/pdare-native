import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import { colors } from '../../core/theme';
import { useStrings } from '../../core/localization/languageContext';

interface PropertyTypeBottomSheetProps {
  currentType: string;
  onTypeChange: (newType: string) => void;
}

const PropertyTypeBottomSheet = forwardRef<any, PropertyTypeBottomSheetProps>(
  ({ currentType, onTypeChange }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => [280, 340], []);

    const strings = useStrings();

    const handleOpenModal = useCallback(() => {
      bottomSheetRef.current?.expand();
    }, []);

    const handleCloseModal = useCallback(() => {
      bottomSheetRef.current?.close();
    }, []);

    useImperativeHandle(ref, () => ({
      openModal: handleOpenModal,
      closeModal: handleCloseModal,
    }));

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          enableTouchThrough={false}
          pressBehavior="close"
        />
      ),
      []
    );

    const handleTypeSelection = useCallback(
      (type: string) => {
        onTypeChange(type);
        handleCloseModal();
      },
      [onTypeChange, handleCloseModal]
    );

    return (
      <Portal>
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={styles.handleIndicator}
          backgroundStyle={styles.bottomSheetBackground}
        >
          <BottomSheetView style={styles.container}>
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{strings.CHANGE_SELECTION_TYPE}</Text>
              <Text style={styles.subtitle}>{strings.SELECTION_TYPE_DESCRIPTION}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, currentType === 'singleselect' && styles.selectedButton]}
                  onPress={() => handleTypeSelection('singleselect')}
                >
                  <Text style={styles.buttonText}>{strings.SINGLE}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, currentType === 'multiselect' && styles.selectedButton]}
                  onPress={() => handleTypeSelection('multiselect')}
                >
                  <Text style={styles.buttonText}>{strings.MULTIPLE}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BottomSheetView>
        </BottomSheet>
      </Portal>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center', // Centers content vertically
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center', // Centers content horizontally
    justifyContent: 'center', // Additional vertical centering
  },
  buttonContainer: {
    width: '100%', // Takes full width to ensure buttons are properly centered
    maxWidth: 300, // Maximum width for buttons
    marginTop: 20,
  },
  bottomSheetBackground: {
    backgroundColor: colors.darkGrey,
  },
  handleIndicator: {
    backgroundColor: '#fff',
    width: 40,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.lighterGrey,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    height: 50,
    justifyContent: 'center', // Centers button text vertically
    alignItems: 'center', // Centers button text horizontally
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
