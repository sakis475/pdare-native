import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Keyboard, Platform, StyleSheet, Text, View } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import { TouchableOpacity } from 'react-native-gesture-handler';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { colors } from '../../core/theme';
import { List, Switch, SegmentedButtons } from 'react-native-paper';
import { CategoryHeader } from '../helpers/CategoryHeader';
import { useStrings } from '../../core/localization/languageContext';
import CouvertModal from '../popupModals/CouvertModal';

interface MoreOptionsTempBottomSheet {
  onChangeTable?: () => void;
  onChangeCouvert?: (quantity: number) => void;
  onPrint?: (destination: 'all' | 'bar' | 'kitchen') => void;
  onCustomerAnalysis?: () => void;
}

const MoreOptionsTempBottomSheet = forwardRef<any, MoreOptionsTempBottomSheet>(
  ({ onChangeTable, onChangeCouvert, onPrint, onCustomerAnalysis }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [isPrintEnabled, setIsPrintEnabled] = useState(false);
    const [printDestination, setPrintDestination] = useState('all');
    const snapPoints = useMemo(() => ['65%', '65%'], []);
    const strings = useStrings();
    const [openCouvertModal, setOpenCouvertModal] = useState(false);

    const handleOpenModal = useCallback(async () => {
      bottomSheetRef.current?.expand();
    }, []);

    const handleCloseModal = () => {
      Keyboard.dismiss();
      setTimeout(() => {
        bottomSheetRef.current?.close();
      }, 200);
    };

    useImperativeHandle(ref, () => ({
      openModal: handleOpenModal,
      closeModal: handleCloseModal,
    }));

    const handlePrintToggle = (value: boolean) => {
      setIsPrintEnabled(value);
      if (value) {
        onPrint?.(printDestination as 'all' | 'bar' | 'kitchen');
      }
    };

    const CloseModalBtn = () => (
      <View>
        <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
          <Text style={styles.closeButtonText}>
            {strings.CLOSE}{' '}
            <FontAwesomeIcon name={'angle-double-down'} size={20} color={colors.white} />
          </Text>
        </TouchableOpacity>
      </View>
    );

    return (
      <>
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
                onPress={handleCloseModal}
              />
            )}
            handleIndicatorStyle={{ backgroundColor: '#fff' }}
            backgroundStyle={{ backgroundColor: colors.darkGrey }}
          >
            <BottomSheetView style={styles.tableChangeContainer}>
              <View style={styles.contentContainer}>
                <CategoryHeader title={strings.MORE_OPTIONS} />

                <List.Section style={styles.listSection}>
                  <TouchableOpacity
                    onPress={() => {
                      onChangeTable();
                      handleCloseModal();
                    }}
                  >
                    <List.Item
                      title="Change Table"
                      description="Move the current order to a different table"
                      descriptionStyle={styles.listItemDescription}
                      left={(props) => (
                        <List.Icon {...props} icon="table-furniture" color={colors.white} />
                      )}
                      titleStyle={styles.listItemTitle}
                      style={styles.listItem}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setOpenCouvertModal(true);
                      handleCloseModal();
                    }}
                  >
                    <List.Item
                      title="Change Couvert"
                      description="Modify the cover charge for the current order"
                      descriptionStyle={styles.listItemDescription}
                      left={(props) => (
                        <List.Icon {...props} icon="silverware" color={colors.white} />
                      )}
                      titleStyle={styles.listItemTitle}
                      style={styles.listItem}
                    />
                  </TouchableOpacity>

                  <View style={styles.printSection}>
                    <List.Item
                      title="Re-print Order"
                      description="Print a copy of the order"
                      descriptionStyle={styles.listItemDescription}
                      left={(props) => <List.Icon {...props} icon="printer" color={colors.white} />}
                      titleStyle={styles.listItemTitle}
                      style={styles.listItem}
                    />

                    <View style={styles.printControls}>
                      <SegmentedButtons
                        value={printDestination}
                        onValueChange={setPrintDestination}
                        buttons={[
                          { value: 'all', label: 'All' },
                          { value: 'bar', label: 'Bar' },
                          { value: 'kitchen', label: 'Kitchen' },
                        ]}
                        style={styles.segmentedButtons}
                        theme={{
                          colors: {
                            onSurface: colors.white,
                            onSurfaceVariant: colors.white,
                          },
                        }}
                      />
                      <TouchableOpacity
                        style={styles.printButton}
                        onPress={() => onPrint?.(printDestination as 'all' | 'bar' | 'kitchen')}
                      >
                        <Text style={styles.printButtonText}>PRINT</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity onPress={onCustomerAnalysis}>
                    <List.Item
                      title="Print Analysis"
                      description="Print final order analysis"
                      descriptionStyle={styles.listItemDescription}
                      left={(props) => <List.Icon {...props} icon="receipt" color={colors.white} />}
                      titleStyle={styles.listItemTitle}
                      style={styles.listItem}
                    />
                  </TouchableOpacity>
                </List.Section>

                {Platform.OS === 'ios' ? <CloseModalBtn /> : null}
              </View>
              {Platform.OS === 'android' ? <CloseModalBtn /> : null}
            </BottomSheetView>
          </BottomSheet>
        </Portal>
        <CouvertModal
          couvertQuantity={1}
          onSubmit={(quantity: number) => {
            onChangeCouvert(quantity);
            setOpenCouvertModal(false);
          }}
          onModalClose={() => setOpenCouvertModal(false)}
          isModalVisible={openCouvertModal}
        ></CouvertModal>
      </>
    );
  }
);

const styles = StyleSheet.create({
  tableChangeContainer: {
    flex: 1,
    paddingTop: 20,
  },
  contentContainer: {
    flex: 1,
    gap: 3,
  },
  closeButton: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: colors.white,
    textAlign: 'center',
  },
  listSection: {
    backgroundColor: 'transparent',
  },
  listItem: {
    paddingVertical: 8,
  },
  listItemTitle: {
    color: colors.white,
    fontSize: 16,
  },
  listItemDescription: {
    color: colors.slightlyLighterGrey,
    fontSize: 12,
    marginTop: 2,
  },
  printSection: {
    borderWidth: 1,
    borderColor: colors.slightlyLighterGrey,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 8,
  },
  printControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  segmentedButtons: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  printButton: {
    backgroundColor: colors.green,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  printButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default MoreOptionsTempBottomSheet;
