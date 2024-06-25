import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Keyboard, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';

import * as Requests from '../../helpers/requests';
import { colors } from '../../core/theme';
import { SelectTable } from './SelectTable';
import { getStorage } from '../../storage/store';

interface TableSelectBottomSheetProps {
  handleSelectTable: (table: any) => void;
}

const TableSelectBottomSheet = forwardRef<any, TableSelectBottomSheetProps>(
  ({ handleSelectTable }, ref) => {
    const [availableTables, setAvailableTables] = useState<any>([]);

    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => [300, 300], []);

    const handleOpenModal = useCallback(async () => {
      bottomSheetRef.current?.expand();
      const availableTables = await getStorage('availableTables'); //await Requests.getRequest('/tables?availableOnly=true');

      setAvailableTables(availableTables);
    }, [setAvailableTables]);

    const handleCloseModal = useCallback(() => {
      bottomSheetRef.current?.close();
      Keyboard.dismiss();
      setAvailableTables([]);
    }, [setAvailableTables]);

    const handleSheetChanges = (index: number) => {
      if (index === -1) {
        handleCloseModal();
      }
    };

    useImperativeHandle(ref, () => ({
      openModal: handleOpenModal,
      closeModal: handleCloseModal,
    }));

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
        enableOverDrag={true}
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
          <SelectTable
            allTables={availableTables}
            onTableSelect={(table: any) => {
              handleCloseModal();
              handleSelectTable(table);
            }}
          />
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  tableChangeContainer: {
    paddingTop: 20,
    paddingHorizontal: 2,
    justifyContent: 'center',
    height: 300,
  },
});
export default TableSelectBottomSheet;
