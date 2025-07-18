import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { colors } from '../../core/theme';
import { SelectTable } from '../tableSelect/SelectTable';
import { Portal } from '@gorhom/portal';
import { reqFetchTables } from '../../helpers/storage/tablesStorage';
import { Table } from '../../types/basic.types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TableSelectBottomSheetProps {
  handleSelectTable: (table: Table) => void;
}

const TableSelectBottomSheet = forwardRef<any, TableSelectBottomSheetProps>(
  ({ handleSelectTable }, ref) => {
    const [availableTables, setAvailableTables] = useState<Table[]>([]);
    const [renderKey, setRenderKey] = useState<number>(0);

    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['80%', '80%'], []);
    const insets = useSafeAreaInsets();
    const handleOpenModal = useCallback(async () => {
      bottomSheetRef.current?.expand();
      let allTables = await reqFetchTables();
      if (Array.isArray(allTables)) {
        allTables = allTables
          .filter((e) => !e.occupiedByOrder)
          .sort((a, b) => a.tableOrder - b.tableOrder);
        setAvailableTables(allTables);
      }
    }, [setAvailableTables]);

    const handleCloseModal = useCallback(() => {
      bottomSheetRef.current?.close();
      setAvailableTables([]);
      setRenderKey((prevKey) => prevKey + 1);
    }, [setAvailableTables]);

    const handleSheetChanges = (index: number) => {
      // if (index === -1) {
      //   Keyboard.dismiss();
      // }
    };

    useImperativeHandle(ref, () => ({
      openModal: handleOpenModal,
      closeModal: handleCloseModal,
    }));

    return (
      <Portal>
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
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 80 : 0}
              style={{ flex: 1 }}
            >
              <SelectTable
                key={renderKey} // Add key prop to force re-render
                allTables={availableTables}
                onTableSelect={(table: Table) => {
                  handleCloseModal();
                  handleSelectTable(table);
                }}
              />
            </KeyboardAvoidingView>
          </BottomSheetView>
        </BottomSheet>
      </Portal>
    );
  }
);

const styles = StyleSheet.create({
  tableChangeContainer: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
});
export default TableSelectBottomSheet;
