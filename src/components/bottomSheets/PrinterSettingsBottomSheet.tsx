import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { colors } from '../../core/theme';
import CustomButton from '../basic/CustomButton';
import CustomSegmentedButtons from '../basic/CustomSegmentedButtons';
import { useStrings } from '../../core/localization/languageContext';
import { getStorage } from '../../storage/store';
import { PrintersConnectionMethod } from '../../types/basic.types';
import { useHelpModal } from '../../providers/HelpContext';
import { HelpModal } from '../guides/HelpModal';
import PrinterGuide from '../guides/guides/PrintersGuide';
import { HelpIcon } from '../basic/Icons';

interface PrinterSettingsBottomSheetProps {
  onAddPrinter: () => void;
  onSearchPrinters: () => void;
  isScanning: boolean;
  isAppInstalled: boolean;
  updatePrinterConnectionMethod: (method: PrintersConnectionMethod) => void;
}

const PrinterSettingsBottomSheet = forwardRef<any, PrinterSettingsBottomSheetProps>(
  (
    { onAddPrinter, onSearchPrinters, isScanning, isAppInstalled, updatePrinterConnectionMethod },
    ref
  ) => {
    const { showHelpModal, helpContent, helpTitle, closeHelpModal, openHelpModal } = useHelpModal();

    const snapPoints = useMemo(() => ['50%', '50%'], []);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const strings = useStrings();
    const [connectionMethod, setConnectionMethod] =
      useState<PrintersConnectionMethod>('SmartphoneClient');

    useEffect(() => {
      const fetchDefaultConnectionMethod = async () => {
        const user = await getStorage('currentUser');
        const restaurant = user?.restaurant;
        setConnectionMethod(restaurant?.printersConnectionMethod || 'SmartphoneClient');
      };

      fetchDefaultConnectionMethod();

      // openHelpModal(<PrinterGuide></PrinterGuide>, strings.MORE_INFO);
    }, []);

    const handleOpen = useCallback(() => {
      bottomSheetRef.current?.expand();
    }, []);

    const handleClose = useCallback(() => {
      bottomSheetRef.current?.close();
    }, []);

    const handleConnectionMethodChange = (value: string) => {
      const method = value as PrintersConnectionMethod;
      setConnectionMethod(method);
      updatePrinterConnectionMethod(method);
    };

    useImperativeHandle(ref, () => ({
      open: handleOpen,
      close: handleClose,
    }));

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        backdropComponent={(backdropProps) => (
          <BottomSheetBackdrop
            {...backdropProps}
            enableTouchThrough={false}
            opacity={0.7}
            onPress={handleClose}
          />
        )}
        backgroundStyle={{ backgroundColor: colors.darkGrey }}
        handleIndicatorStyle={{ backgroundColor: colors.white }}
        enablePanDownToClose={true}
      >
        <BottomSheetView style={styles.content}>
          <View style={styles.segmentedButtonsContainer}>
            <CustomSegmentedButtons
              value={connectionMethod}
              onValueChange={handleConnectionMethodChange}
              buttons={[
                { value: 'SmartphoneClient', label: strings.NETWORK },
                { value: 'DesktopApp', label: strings.PRINT_SERVER },
              ]}
              style={styles.segmentedButtons}
              variant="dark"
            />
            <TouchableOpacity onPress={() => openHelpModal(<PrinterGuide />, strings.MORE_INFO)}>
              <HelpIcon size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
          <CustomButton onPress={onAddPrinter} style={styles.button}>
            {strings.ADD_NEW_PRINTER}
          </CustomButton>
          {isAppInstalled && connectionMethod === 'DesktopApp' && (
            <CustomButton
              onPress={onSearchPrinters}
              style={styles.button}
              loading={isScanning}
              disabled={isScanning}
            >
              {strings.SEARCH_PRINTERS}
            </CustomButton>
          )}
        </BottomSheetView>
        <HelpModal
          visible={showHelpModal}
          onClose={closeHelpModal}
          helpContent={helpContent}
          title={helpTitle}
        />
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  segmentedButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  button: {
    marginBottom: 16,
  },
  segmentedButtons: {
    flex: 1,
  },
});

export default PrinterSettingsBottomSheet;
