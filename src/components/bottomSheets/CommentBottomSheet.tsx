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
import { TouchableOpacity } from 'react-native-gesture-handler';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { colors } from '../../core/theme';
import { TextInput } from 'react-native-paper';
import { CategoryHeader } from '../helpers/CategoryHeader';

interface CommentBottomSheetProps {
  item: ItemReq;
  itemCommentChange: any;
}

const CommentBottomSheet = forwardRef<any, CommentBottomSheetProps>(
  ({ item, itemCommentChange }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const textInputRef = useRef<any>(null); // TextInput ref
    const snapPoints = useMemo(() => ['80%', '80%'], []);

    const [commentText, setCommentText] = useState(item.comment ? item.comment : '');

    const handleOpenModal = useCallback(async () => {
      bottomSheetRef.current?.expand();
      textInputRef.current?.focus();
    }, []);

    const handleCloseModal = () => {
      itemCommentChange(commentText);
      Keyboard.dismiss();
      setTimeout(() => {
        bottomSheetRef.current?.close();
      }, 200);
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
          <BottomSheetView style={styles.tableChangeContainer}>
            <CategoryHeader title="Σχόλιο"></CategoryHeader>
            <View style={{ marginTop: 3, flex: 1 }}>
              <TextInput
                mode={'flat'}
                value={commentText}
                placeholder="Γράψε σχόλιο για το προϊόν"
                onChangeText={(changedText) => {
                  setCommentText(changedText);
                }}
                contentStyle={{ backgroundColor: colors.white }}
                style={{ backgroundColor: colors.white, minHeight: 100, fontSize: 20 }}
                textColor={colors.black}
                ref={textInputRef} // Set ref here
                multiline={true}
              />
              <View style={{ marginTop: 3, flex: 1 }}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    handleCloseModal();
                  }}
                >
                  <Text style={styles.closeButtonText}>
                    Κλείσιμο <FontAwesomeIcon name={'angle-double-down'} size={20} color={colors.white} />
                  </Text>
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
  tableChangeContainer: {
    paddingTop: 20,
    justifyContent: 'center',
    height: '100%',
  },
  closeButton: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', // Center align the text horizontally
    justifyContent: 'center', // Center align the text vertically
  },
  closeButtonText: {
    color: colors.white,
    textAlign: 'center',
  },
});

export default CommentBottomSheet;
