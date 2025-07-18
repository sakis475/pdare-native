import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';

import { Portal } from '@gorhom/portal';
import TempOrderScreen from '../../screens/orderScreens/tempOrderScreen';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { colors } from '../../core/theme';
import { useStrings } from '../../core/localization/languageContext';
import { DoubleDownIcon } from '../basic/Icons';
import { ItemReq } from '../../types/basic.types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TempOrderBottomSheet = forwardRef<any>((_, ref) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['93%', '93%'], []);
  const insets = useSafeAreaInsets();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const strings = useStrings();

  const handleOpenModal = useCallback(async () => {
    setIsSheetOpen(true);
    bottomSheetRef.current?.expand();
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsSheetOpen(false);
    bottomSheetRef.current?.close();
    Keyboard.dismiss();
  }, []);

  const handleSheetChanges = (index: number) => {
    if (index === -1) {
      handleCloseModal();
    }
  };

  useImperativeHandle(ref, () => ({
    openModal: handleOpenModal,
    closeModal: handleCloseModal,
  }));

  const handleItemPress = (item: ItemReq) => {
    // Handle the item press event
    setTimeout(() => {
      handleCloseModal();
    }, 200);
  };

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
        <BottomSheetView style={[styles.tableChangeContainer, { paddingBottom: insets.bottom }]}>
          <TempOrderScreen
            bottomSheetMode={true}
            isSheetOpen={isSheetOpen}
            onItemPress={handleItemPress}
          />
          <View style={{ marginTop: 3 }}>
            <TouchableOpacity
              style={{ padding: 20, backgroundColor: 'rgba(0,0,0,0.5)' }}
              onPress={handleCloseModal}
            >
              <Text style={{ textAlign: 'center', color: colors.white }}>
                {strings.CLOSE} <DoubleDownIcon />
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </Portal>
  );
});

const styles = StyleSheet.create({
  tableChangeContainer: {
    paddingTop: 20,
    justifyContent: 'center',
    height: '100%',
  },
});
export default TempOrderBottomSheet;
