import React from 'react';
import {
  Modal,
  View,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
} from 'react-native';
import { Button } from 'react-native-paper';
import { colors } from '../../core/theme';
import { useStrings } from '../../core/localization/languageContext';

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children: React.ReactNode;
  testID?: string;
  backgroundColor?: string;
  showButtons?: boolean;
  title: string;
}

const BaseModal: React.FC<BaseModalProps> = ({
  visible,
  onClose,
  onConfirm,
  children,
  testID,
  backgroundColor = colors.grey,
  showButtons = true,
  title = '',
}) => {
  const strings = useStrings();
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.overlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                  <View style={[styles.contentContainer, { backgroundColor }]}>
                    {title ? <Text style={styles.modalTitle}>{title}</Text> : null}

                    <ScrollView
                      bounces={false}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.scrollContent}
                    >
                      {children}
                    </ScrollView>
                    {showButtons && (
                      <View style={styles.buttonContainer}>
                        <Button
                          mode="outlined"
                          onPress={onClose}
                          style={styles.button}
                          textColor={colors.lightRed}
                          labelStyle={styles.buttonLabel}
                          contentStyle={styles.buttonContent}
                        >
                          {strings.CANCEL}
                        </Button>
                        <Button
                          mode="contained"
                          style={[styles.button, styles.confirmButton]}
                          onPress={onConfirm}
                          textColor={colors.white}
                          labelStyle={styles.buttonLabel}
                          contentStyle={styles.buttonContent}
                        >
                          {strings.SAVE}
                        </Button>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'android' ? 100 : 0,
    paddingTop: Platform.select({ ios: 50, android: 80 }),
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    maxHeight: Platform.OS === 'ios' ? '90%' : '90%',
    transform: [{ translateY: -20 }],
  },
  contentContainer: {
    borderRadius: 10,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.grey,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginHorizontal: -20,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  button: {
    flex: 1,
    borderRadius: 5,
    minWidth: 100,
  },
  buttonLabel: {
    fontSize: 12,
    lineHeight: 20,
  },
  buttonContent: {
    height: 40,
    paddingHorizontal: 8,
  },
  confirmButton: {
    backgroundColor: colors.green,
  },
});

export default BaseModal;
