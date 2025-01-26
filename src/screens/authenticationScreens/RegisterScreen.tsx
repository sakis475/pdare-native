import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text, TextInput, Button, Divider, Portal, Dialog, Checkbox } from 'react-native-paper';
import { ScrollView, State } from 'react-native-gesture-handler';
import { colors } from '../../core/theme';
import { postRequest, setBearer } from '../../helpers/requests';
import { clearRestaurantStorageRelatedKeys } from '../../storage/store';
import { register, RegisterData } from '../../helpers/storage/tokenRequests';
import { useStrings } from '../../core/localization/languageContext';
import CustomTextInput from '../../components/basic/CustomTextInput';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FormField {
  value: string;
  error: string;
}

export interface FormState {
  email: FormField;
  password: FormField;
  passwordRepeat: FormField;
}

interface FormFieldProps {
  label: string;
  value: string;
  error: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  secureTextEntry?: boolean;
  keyboardType?: 'email-address' | 'default';
}

interface PrivacyPolicyDialogProps {
  visible: boolean;
  onDismiss: () => void;
}

export interface ValidationRule {
  validate: (value: string, formState: FormState) => string;
  fieldName: keyof FormState;
}

export const initialFormState: FormState = {
  email: { value: '', error: '' },
  password: { value: '', error: '' },
  passwordRepeat: { value: '', error: '' },
};

const FormField: React.FC<
  FormFieldProps & {
    value: string;
    error: string;
    onChangeText: (text: string) => void;
    onBlur: () => void;
  }
> = React.memo(
  ({
    label,
    secureTextEntry = false,
    keyboardType = 'default',
    value,
    error,
    onChangeText,
    onBlur,
  }) => (
    <View style={styles.fieldWrapper}>
      <CustomTextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        error={!!error}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
);

const RegisterScreen: React.FC = () => {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [policyDialogVisible, setPolicyDialogVisible] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [showPolicyError, setShowPolicyError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strings = useStrings();

  const validationRules: Record<keyof FormState, ValidationRule> = {
    email: {
      validate: (value) => {
        if (!value) return strings.EMAIL_REQUIRED;
        const re = /\S+@\S+\.\S+/;
        return !re.test(value) ? strings.ERROR_EMAIL_INVALID : '';
      },
      fieldName: 'email',
    },
    password: {
      validate: (value, state) => {
        if (!value) return strings.PASSWORD_REQUIRED;
        if (value.length < 5) return strings.PASSWORD_LENGTH;

        return '';
      },
      fieldName: 'password',
    },
    passwordRepeat: {
      validate: (value, state) => {
        return value !== state.password.value ? strings.PASSWORDS_DO_NOT_MATCH : '';
      },
      fieldName: 'passwordRepeat',
    },
  };

  const PrivacyPolicyDialog: React.FC<PrivacyPolicyDialogProps> = ({ visible, onDismiss }) => (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title style={styles.dialogTitle}>{strings.PRIVACY_POLICY}</Dialog.Title>
        <Dialog.ScrollArea style={styles.dialogScrollArea}>
          <ScrollView>
            <Text style={styles.policyText}>{strings.PRIVACY_POLICY_TEXT}</Text>
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={onDismiss} textColor={colors.white}>
            {strings.CLOSE}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const handleFieldChange = useCallback((fieldName: keyof FormState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value,
        error: '',
      },
    }));
  }, []);

  const handleFieldBlur = useCallback(
    (fieldName: keyof FormState) => {
      const rule = validationRules[fieldName];
      const error = rule.validate(formState[fieldName].value, formState);

      if (error) {
        setFormState((prev) => ({
          ...prev,
          [fieldName]: {
            ...prev[fieldName],
            error,
          },
        }));
      }
    },
    [formState]
  );

  const validateForm = useCallback((): boolean => {
    let hasErrors = false;
    const updatedFormState = { ...formState };

    Object.entries(validationRules).forEach(([fieldName, rule]) => {
      const error = rule.validate(formState[fieldName as keyof FormState].value, formState);
      if (error) {
        hasErrors = true;
        updatedFormState[fieldName as keyof FormState].error = error;
      }
    });

    if (hasErrors) {
      setFormState(updatedFormState);
    }

    return !hasErrors;
  }, [formState]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (!policyAccepted) {
        setShowPolicyError(true);
        return;
      }
      setShowPolicyError(false);

      const isValid = validateForm();

      if (isValid) {
        const formData = Object.entries(formState).reduce(
          (acc, [key, field]) => ({
            ...acc,
            [key]: field.value,
          }),
          {}
        ) as RegisterData;

        await register(formData);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formState, policyAccepted, validateForm]);

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <Text style={styles.header}>{strings.CREATE_ACCOUNT}</Text>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.fieldsContainer}>
            <FormField
              label={strings.EMAIL}
              value={formState.email.value}
              error={formState.email.error}
              onChangeText={(text) => handleFieldChange('email', text)}
              onBlur={() => handleFieldBlur('email')}
              keyboardType="email-address"
            />
            <FormField
              label={strings.PASSWORD}
              value={formState.password.value}
              error={formState.password.error}
              onChangeText={(text) => handleFieldChange('password', text)}
              onBlur={() => handleFieldBlur('password')}
              secureTextEntry
            />
            <FormField
              label={strings.PASSWORD_CONFIRMATION}
              value={formState.passwordRepeat.value}
              error={formState.passwordRepeat.error}
              onChangeText={(text) => handleFieldChange('passwordRepeat', text)}
              onBlur={() => handleFieldBlur('passwordRepeat')}
              secureTextEntry
            />
          </View>

          <View style={styles.policyContainer}>
            <View style={styles.checkboxContainer}>
              <Checkbox.Android
                status={policyAccepted ? 'checked' : 'unchecked'}
                onPress={() => {
                  setPolicyAccepted(!policyAccepted);
                  setShowPolicyError(false);
                }}
                color={colors.white}
              />
              <Text style={styles.policyText}>
                {strings.AGREE_TO_PRIVACY}{' '}
                <Text style={styles.policyLink} onPress={() => setPolicyDialogVisible(true)}>
                  {strings.PRIVACY_POLICY_LINK}
                </Text>
              </Text>
            </View>
            {showPolicyError && <Text style={styles.error}>{strings.PRIVACY_POLICY_REQUIRED}</Text>}
          </View>
        </ScrollView>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={handleSubmit} style={styles.button} disabled={isSubmitting}>
          <Text style={styles.buttonText}>{strings.REGISTER}</Text>
        </TouchableOpacity>
      </View>

      <PrivacyPolicyDialog
        visible={policyDialogVisible}
        onDismiss={() => setPolicyDialogVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBlack,
  },
  mainContent: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  fieldsContainer: {
    gap: 15,
  },
  fieldWrapper: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: colors.darkerGrey,
  },
  bottomContainer: {
    backgroundColor: colors.darkerGrey,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: colors.slightlyLighterGrey,
  },
  button: {
    backgroundColor: colors.slightlyLighterGrey,
    borderWidth: 1,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    borderRadius: 6,
    height: 60,
  },
  buttonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
  error: {
    fontSize: 14,
    color: colors.lightRed,
    paddingVertical: 4,
  },
  policyContainer: {
    marginVertical: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  policyText: {
    color: colors.white,
    flex: 1,
    marginLeft: 8,
  },
  policyLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  dialog: {
    backgroundColor: colors.darkerGrey,
    maxHeight: '80%',
    width: '90%',
    alignSelf: 'center',
  },
  dialogTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  dialogScrollArea: {
    paddingHorizontal: 0,
    maxHeight: SCREEN_WIDTH * 1.2,
  },
});

export default RegisterScreen;
