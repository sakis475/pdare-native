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
import { List } from 'react-native-paper';
import { CategoryHeader } from '../helpers/CategoryHeader';
import { useStrings } from '../../core/localization/languageContext';
import CouvertModal from '../popupModals/CouvertModal';
import { AlertWithOptions, toast } from '../../core/utils';
import { patchRequest } from '../../helpers/requests';
import { navigateToTables } from '../../navigation/navigationUtils';
import dayjs from '../../core/dayjs';
import { DoubleDownIcon } from '../basic/Icons';
import CustomSegmentedButtons from '../basic/CustomSegmentedButtons';
import CustomButton from '../basic/CustomButton';
import { Order, PrintLocation } from '../../types/basic.types';

interface MoreOptionsTempBottomSheet {
  onChangeTable?: () => void;
  onChangeCouvert?: (quantity: number) => void;
  onPrint?: (printLocation: PrintLocation) => void;
  onCustomerAnalysis?: () => void;
  onCloseOrder?: () => void;
  order: Order;
}

const MoreOptionsTempBottomSheet = forwardRef<any, MoreOptionsTempBottomSheet>(
  ({ onChangeTable, onChangeCouvert, onPrint, onCustomerAnalysis, onCloseOrder, order }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [printDestination, setPrintDestination] = useState<PrintLocation>(PrintLocation.ALL);
    const snapPoints = useMemo(() => ['95%', '95%'], []);
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

    const CloseModalBtn = () => (
      <View>
        <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
          <Text style={styles.closeButtonText}>
            {strings.CLOSE} <DoubleDownIcon></DoubleDownIcon>
          </Text>
        </TouchableOpacity>
      </View>
    );

    const showChangeTable = order && !order?.closedAt;
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

                      <View style={styles.printLocationContainer}>
                        <Text style={styles.printLocationLabel}>{strings.PRINT_LOCATION}</Text>
                        <View style={styles.printControls}>
                          <CustomSegmentedButtons
                            value={printDestination}
                            onValueChange={(e) => {
                              console.log('New value:', e);
                              setPrintDestination(e as PrintLocation);
                            }}
                            buttons={[
                              { value: PrintLocation.ALL, label: strings.ALL },
                              { value: PrintLocation.BAR, label: strings.BAR },
                              { value: PrintLocation.KITCHEN, label: strings.KITCHEN },
                            ]}
                            style={styles.segmentedButtons}
                            variant="dark"
                          />
                          <CustomButton
                            onPress={() => {
                              onPrint?.(printDestination);
                              handleCloseModal();
                            }}
                          >
                            <Text>{strings.PRINT}</Text>
                          </CustomButton>
                        </View>
                      </View>
                    </View>
                  ) : null}

                  {showPrintAnalysis ? (
                    <TouchableOpacity
                      onPress={() => {
                        onCustomerAnalysis();
                        handleCloseModal();
                      }}
                    >
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
                    <TouchableOpacity
                      onPress={() => {
                        onCloseOrder();
                        handleCloseModal();
                      }}
                    >
                      <List.Item
                        title={strings.CLOSE_ORDER}
                        description={strings.CLOSE_ORDER_DESCRIPTION}
                        descriptionStyle={styles.listItemDescription}
                        left={(props) => (
                          <List.Icon {...props} icon="close" color={colors.danger} />
                        )}
                        titleStyle={[styles.listItemTitle, { color: colors.danger }]}
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
                        left={(props) => <List.Icon {...props} icon="apps" color={colors.white} />}
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
    paddingTop: 16,
  },
  contentContainer: {
    flex: 1,
    gap: 2,
  },
  printLocationContainer: {
    marginTop: 8,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  printLocationLabel: {
    color: colors.veryLighterGrey,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  closeButton: {
    padding: 16,
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
    paddingVertical: 4,
  },
  listItem: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  listItemTitle: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 18,
  },
  listItemDescription: {
    color: colors.slightlyLighterGrey,
    fontSize: 11,
    marginTop: 1,
    lineHeight: 14,
  },
  printSection: {
    borderWidth: 1,
    borderColor: colors.slightlyLighterGrey,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 6,
  },
  printControls: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 8,
  },
  segmentedButtons: {
    flex: 1,
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  printButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 13,
  },
});

export default MoreOptionsTempBottomSheet;
