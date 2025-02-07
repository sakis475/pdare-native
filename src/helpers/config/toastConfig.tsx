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
        },
      ]}
    />
  ),
};
