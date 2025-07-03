import { BaseToast, BaseToastProps, ToastConfig } from 'react-native-toast-message';
import { colors } from '../../core/theme';

const toastProps: BaseToastProps = {
  text1NumberOfLines: 0,
  text2NumberOfLines: 0,
};

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      {...toastProps}
      style={[
        toastProps.style,
        {
          borderLeftColor: colors.green,
          marginTop: 60,
        },
      ]}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      {...toastProps}
      style={[
        toastProps.style,
        {
          borderLeftColor: colors.veryLighterBlue,
          marginTop: 60,
        },
      ]}
    />
  ),
  error: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      {...toastProps}
      style={[
        toastProps.style,
        {
          borderLeftColor: colors.danger,
          marginTop: 60,
        },
      ]}
    />
  ),
  warning: (props) => (
    <BaseToast
      {...props}
      {...toastProps}
      style={[
        toastProps.style,
        {
          borderLeftColor: colors.lightBlack,
          marginTop: 60,
        },
      ]}
    />
  ),
};
