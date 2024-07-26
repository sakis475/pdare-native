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
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

const TempOrderBottomSheet = forwardRef<any>((_, ref) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['90%', '90%'], []);

  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
    console.log('Item pressed:', item);
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
        backgroundStyle={{ backgroundColor: '#2F2F2F' }}
      >
        <BottomSheetView style={styles.tableChangeContainer}>
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
              <Text style={{ textAlign: 'center', color: '#fff' }}>
                Κλείσιμο <FontAwesomeIcon name={'angle-double-down'} size={20} color="#fff" />
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
