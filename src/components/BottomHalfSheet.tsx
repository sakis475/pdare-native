import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  // Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import IoniconsIcons from 'react-native-vector-icons/Ionicons';
import { colors } from '../core/theme';
import { strings } from '../core/strings';
import { TextInput } from 'react-native-paper';
import TableSelectContainer from './tableSelect/TableSelectHorizontalContainer';
import { SelectTable } from './tableSelect/SelectTable';
import Modal from 'react-native-modal';

export function BottomHalfSheet({
  showModal,
  closeModal,
  component,
  title = strings.ChooseTable,
}: any) {
  const [allTables, setAllTables]: any = useState([
    { key: '2', text: '2', occupiedBy: null },
    { key: '1', text: '1', occupiedBy: null },
    { key: '7', text: '7', occupiedBy: null },
    { key: '8', text: '8', occupiedBy: 1 },
    { key: '3', text: '3', occupiedBy: 4 },
    { key: '6', text: '6', occupiedBy: null },
    { key: '9', text: '9', occupiedBy: null },
    { key: '4', text: '4', occupiedBy: null },
    { key: '5', text: '5', occupiedBy: null },
    { key: '10', text: '10', occupiedBy: null },
  ]);

  // useEffect(() => {
  //   if (showModal) {
  //     // Focus on the TextInput and open keyboard when modal is shown
  //     setTimeout(() => {
  //       Keyboard.dismiss();
  //       setTimeout(() => {
  //         // Using setTimeout to ensure Keyboard.dismiss() is called before focusing
  //         textInputRef.current?.focus();
  //       }, 100);
  //     }, 100);
  //   }
  // }, [showModal]);

  // const textInputRef = React.createRef();

  return (
    <Modal
      animationIn="slideInUp" // Modal slides in from the bottom
      animationOut="slideOutDown" // Modal slides out towards the bottom
      animationInTiming={100}
      animationOutTiming={300} // Set a reasonable timing for the slide out animation
      backdropTransitionInTiming={0}
      isVisible={showModal}
      useNativeDriver={true}
      useNativeDriverForBackdrop={true}
      hideModalContentWhileAnimating={true}
      onBackButtonPress={closeModal}
      style={{ margin: 0 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.innerContainer}>
          <TouchableOpacity onPress={closeModal} style={styles.touchableContainer}>
            <Text style={{ fontSize: 20 }}>{title}</Text>
            <Text style={styles.iconContainer}>
              <IoniconsIcons name="chevron-down-outline" size={30}></IoniconsIcons>
            </Text>
          </TouchableOpacity>
          <View>{component}</View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const windowHeight = Dimensions.get('window').height;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  innerContainer: {
    backgroundColor: colors.darkerGrey,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: windowHeight * 0.25,
  },
  touchableContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 30,
  },
  iconContainer: {
    // marginLeft: 10,
  },
});
