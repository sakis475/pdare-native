import { Alert } from 'react-native';
import Toast, { ToastType } from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';
import { colors } from './theme';
import { strings as defaultStrings } from './localization/strings';
import { LocalizedStrings } from 'react-native-localization';

export const emailValidator = (email: string, strings: LocalizedStrings<any>) => {
  const re = /\S+@\S+\.\S+/;

  if (!email || email.length <= 0) return strings.ERROR_EMAIL_EMPTY;
  if (!re.test(email)) return strings.ERROR_EMAIL_INVALID;

  return '';
};

export const passwordValidator = (password: string, strings: LocalizedStrings<any>) => {
  const re = /^(?=.*[0-9])(?=.{8,})/;

  if (!password || password.length <= 0) return strings.ERROR_PASSWORD;
  if (password.length < 8) return strings.ERROR_PASSWORD_LENGTH;
  if (!re.test(password)) return strings.ERROR_PASSWORD_NUMBER;
  return '';
};

export const nameValidator = (name: string, strings: LocalizedStrings<any>) => {
  if (!name || name.length <= 0) return strings.ERROR_NAME;
  return '';
};

export function toast(type: ToastType, title: string, text: string = '', visibilityTime = 3000) {
  Toast.show({
    type,
    text1: title,
    text2: text,
    position: 'top',
    topOffset: 10,
    visibilityTime,
  });
}

export function normalizeString(str: string) {
  return str
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/α|ά/gi, 'a')
    .replace(/[\u0300-\u036f]/g, '');
}

export function naturalSort(a: string, b: string) {
  const aNorm = normalizeString(a);
  const bNorm = normalizeString(b);

  const splitPattern = /(\d+|\D+)/g;
  const aParts = aNorm.match(splitPattern) || [];
  const bParts = bNorm.match(splitPattern) || [];

  for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
    const aValue = aParts[i];
    const bValue = bParts[i];

    const aNum = parseInt(aValue);
    const bNum = parseInt(bValue);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      if (aNum !== bNum) {
        return aNum - bNum;
      }
    } else {
      const comparison = aValue.localeCompare(bValue);
      if (comparison !== 0) {
        return comparison;
      }
    }
  }

  return aParts.length - bParts.length;
}

export function AlertWithOptions(
  title: string,
  message: string,
  onOK: any = () => {},
  onCancel: any = () => {},
  okTitle: string = defaultStrings.OK,
  cancelTitle: string = defaultStrings.CANCEL
) {
  Alert.alert(
    title,
    message,
    [
      {
        text: cancelTitle,
        onPress: onCancel,
        style: 'cancel',
      },
      { text: okTitle, onPress: onOK },
    ],
    { cancelable: false }
  );

  return true;
}

export const checkInternetConnectivity = async () => {
  try {
    const state = await NetInfo.fetch();

    if (!state.isConnected || !state.isInternetReachable) {
      toast('error', defaultStrings.ERROR_NO_INTERNET);
      return false;
    }
    return true;
  } catch (error) {
    console.log('NetInfo failed', error);
    return false;
  }
};

export const getTextColorBasedOnLuminance = (hexColor: string) => {
  if (!hexColor) {
    return '';
  }
  const rgb = parseInt(hexColor.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  return luminance > 128 ? colors.black : colors.white;
};
