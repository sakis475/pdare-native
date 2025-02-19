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
  showButtons?: boolean;
  title: string;
  theme?: 'light' | 'dark';
  buttonVariant?: 'default' | 'okOnly';
}

const BaseModal: React.FC<BaseModalProps> = ({
  visible,
  onClose,
  onConfirm,
  children,
  testID,
  showButtons = true,
  title = '',
  theme = 'light',
  buttonVariant = 'default',
}) => {
  const strings = useStrings();
  if (!visible) return null;

  const getThemeColors = () => {
    return theme === 'light'
      ? {
          background: colors.white,
          text: colors.grey,
          border: colors.lightGrey,
          buttonBackground: 'rgba(0, 0, 0, 0.05)',
          buttonBorder: 'rgba(0, 0, 0, 0.1)',
          overlay: 'rgba(0, 0, 0, 0.3)',
        }
      : {
          background: colors.grey,
          text: colors.white,
          border: colors.lightGrey,
          buttonBackground: 'rgba(0, 0, 0, 0.2)',
          buttonBorder: 'rgba(255, 255, 255, 0.1)',
          overlay: 'rgba(0, 0, 0, 0.5)',
        };
  };

  const themeColors = getThemeColors();

  const renderButtons = () => {
    if (!showButtons) return null;

    if (buttonVariant === 'okOnly') {
      return (
        <View
          style={[
            styles.buttonContainer,
            styles.okOnlyContainer,
            {
              borderTopColor: themeColors.buttonBorder,
              backgroundColor: themeColors.buttonBackground,
            },
          ]}
        >
          <Button
            mode="outlined"
            style={[styles.button]}
            onPress={onClose}
            textColor={colors.white}
            labelStyle={styles.buttonLabel}
            contentStyle={styles.buttonContent}
          >
            {strings.OK}
          </Button>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.buttonContainer,
          {
            borderTopColor: themeColors.buttonBorder,
            backgroundColor: themeColors.buttonBackground,
          },
        ]}
      >
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
          style={[styles.button, { backgroundColor: colors.purpleIris }]}
          onPress={onConfirm}
          textColor={colors.white}
          labelStyle={styles.buttonLabel}
          contentStyle={styles.buttonContent}
        >
          {strings.SAVE}
        </Button>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.container, { backgroundColor: themeColors.overlay }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.overlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                  <View
                    style={[styles.contentContainer, { backgroundColor: themeColors.background }]}
                  >
                    {title ? (
                      <Text
                        style={[
                          styles.modalTitle,
                          {
                            color: themeColors.text,
                            borderBottomColor: themeColors.border,
                          },
                        ]}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {title}
                      </Text>
                    ) : null}

                    <ScrollView
                      bounces={false}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.scrollContent}
                    >
                      {children}
                    </ScrollView>
                    {renderButtons()}
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
    padding: 10,
    borderBottomWidth: 1,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    marginHorizontal: -20,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  okOnlyContainer: {
    justifyContent: 'flex-end',
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
});

export default BaseModal;
