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
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { colors } from '../../core/theme';
import { List, SegmentedButtons } from 'react-native-paper';
import { CategoryHeader } from '../helpers/CategoryHeader';
import { useStrings } from '../../core/localization/languageContext';
import CouvertModal from '../popupModals/CouvertModal';
import { AlertWithOptions, toast } from '../../core/utils';
import { patchRequest } from '../../helpers/requests';
import { navigateToTables } from '../../navigation/navigationUtils';
import dayjs from '../../core/dayjs';
import { DoubleDownIcon } from '../basic/Icons';

interface MoreOptionsTempBottomSheet {
  onChangeTable?: () => void;
  onChangeCouvert?: (quantity: number) => void;
  onPrint?: (destination: 'all' | 'bar' | 'kitchen') => void;
  onCustomerAnalysis?: () => void;
  onCloseOrder?: () => void;
  order: Order;
}

const MoreOptionsTempBottomSheet = forwardRef<any, MoreOptionsTempBottomSheet>(
  ({ onChangeTable, onChangeCouvert, onPrint, onCustomerAnalysis, onCloseOrder, order }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [isPrintEnabled, setIsPrintEnabled] = useState(false);
    const [printDestination, setPrintDestination] = useState('all');
    const snapPoints = useMemo(() => ['80%', '80%'], []);
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
            {strings.CLOSE} <DoubleDownIcon></DoubleDownIcon>
          </Text>
        </TouchableOpacity>
      </View>
    );

    const showChangeTable = order && !order.closedAt;
    const showChangeCouvert = order?.table && !order.closedAt;
    const showReprintOrder = order?.createdAt && !order?.closedAt;
    const showPrintAnalysis = order?.createdAt;
    const showCloseOrder = order?.createdAt && !order?.closedAt;
    const showReOpenOrder = order?.closedAt && dayjs().diff(dayjs(order.closedAt), 'minute') < 15;

    const onReopenOrder = () => {
      if (order.closedAt) {
        AlertWithOptions(
          strings.REOPEN_ORDER,
          strings.REOPEN_ORDER_CONFIRM,
          async () => {
            const result = await patchRequest(`/orders/reopen/${order.id}`);
            if (result?.success === true) {
              toast('success', strings.REOPENED, '', 1000);
              navigateToTables();
            }
          },
          () => {}
        );
        return;
      }
    };

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
              <ScrollView style={styles.contentContainer}>
                <CategoryHeader title={strings.MORE_OPTIONS} />

                <List.Section style={styles.listSection}>
                  {showChangeTable ? (
                    <TouchableOpacity
                      onPress={() => {
                        onChangeTable();
                        handleCloseModal();
                      }}
                    >
                      <List.Item
                        title={strings.CHANGE_TABLE}
                        description={strings.CHANGE_TABLE_DESCRIPTION}
                        descriptionStyle={styles.listItemDescription}
                        left={(props) => (
                          <List.Icon {...props} icon="table-furniture" color={colors.white} />
                        )}
                        titleStyle={styles.listItemTitle}
                        style={styles.listItem}
                      />
                    </TouchableOpacity>
                  ) : null}
                  {showChangeCouvert ? (
                    <TouchableOpacity
                      onPress={() => {
                        setOpenCouvertModal(true);
                        handleCloseModal();
                      }}
                    >
                      <List.Item
                        title={strings.CHANGE_COUVERT}
                        description={strings.CHANGE_COUVERT_DESCRIPTION}
                        descriptionStyle={styles.listItemDescription}
                        left={(props) => (
                          <List.Icon {...props} icon="silverware" color={colors.white} />
                        )}
                        titleStyle={styles.listItemTitle}
                        style={styles.listItem}
                      />
                    </TouchableOpacity>
                  ) : null}

                  {showReprintOrder ? (
                    <View style={styles.printSection}>
                      <List.Item
                        title={strings.REPRINT_ORDER}
                        description={strings.REPRINT_ORDER_DESCRIPTION}
                        descriptionStyle={styles.listItemDescription}
                        left={(props) => (
                          <List.Icon {...props} icon="printer" color={colors.white} />
                        )}
                        titleStyle={styles.listItemTitle}
                        style={styles.listItem}
                      />

                      <View style={styles.printControls}>
                        <SegmentedButtons
                          value={printDestination}
                          onValueChange={setPrintDestination}
                          buttons={[
                            { value: 'all', label: strings.ALL },
                            { value: 'bar', label: strings.BAR },
                            { value: 'kitchen', label: strings.KITCHEN },
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
                          <Text style={styles.printButtonText}>{strings.PRINT}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : null}

                  {showPrintAnalysis ? (
                    <TouchableOpacity onPress={onCustomerAnalysis}>
                      <List.Item
                        title={strings.PRINT_ANALYSIS}
                        description={strings.PRINT_ANALYSIS_DESCRIPTION}
                        descriptionStyle={styles.listItemDescription}
                        left={(props) => (
                          <List.Icon {...props} icon="receipt" color={colors.white} />
                        )}
                        titleStyle={styles.listItemTitle}
                        style={styles.listItem}
                      />
                    </TouchableOpacity>
                  ) : null}

                  {showCloseOrder ? (
                    <TouchableOpacity onPress={onCloseOrder}>
                      <List.Item
                        title={strings.CLOSE_ORDER}
                        description={strings.CLOSE_ORDER_DESCRIPTION}
                        descriptionStyle={styles.listItemDescription}
                        left={(props) => <List.Icon {...props} icon="close" color={colors.white} />}
                        titleStyle={styles.listItemTitle}
                        style={styles.listItem}
                      />
                    </TouchableOpacity>
                  ) : null}

                  {showReOpenOrder ? (
                    <TouchableOpacity onPress={onReopenOrder}>
                      <List.Item
                        title={strings.REOPEN_ORDER}
                        description={strings.REOPEN_ORDER_DESCRIPTION}
                        descriptionStyle={styles.listItemDescription}
                        left={(props) => (
                          <List.Icon {...props} icon="refresh" color={colors.white} />
                        )}
                        titleStyle={styles.listItemTitle}
                        style={styles.listItem}
                      />
                    </TouchableOpacity>
                  ) : null}
                </List.Section>

                {Platform.OS === 'ios' ? <CloseModalBtn /> : null}
              </ScrollView>
              {Platform.OS === 'android' ? <CloseModalBtn /> : null}
            </BottomSheetView>
          </BottomSheet>
        </Portal>
        <CouvertModal
          couvertQuantity={order?.couvert ?? 0}
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
