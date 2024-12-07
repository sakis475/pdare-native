import { Alert } from 'react-native';
import Toast, { ToastType } from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';
import { colors } from './theme';

export const emailValidator = (email: string) => {
  const re = /\S+@\S+\.\S+/;

  if (!email || email.length <= 0) return `Email can't be empty.`;
  if (!re.test(email)) return 'Ooops! We need a valid email address.';

  return '';
};

export const passwordValidator = (password: string) => {
  const re = /^(?=.*[0-9])(?=.{8,})/;

  if (!password || password.length <= 0) return 'Password cannot be empty.';
  if (password.length < 8) return 'Password must be at least 8 characters long.';
  if (!re.test(password)) return 'Password must contain at least 1 number.';
  return '';
};

export const nameValidator = (name: string) => {
  if (!name || name.length <= 0) return 'Name cannot be empty.';

  return '';
};

export function toast(type: ToastType, title: string, text: string = '', visibilityTime = 3000) {
  Toast.show({
    type,
    text1: title,
    text2: text,
    position: 'top',
    // bottomOffset: 60,
    topOffset: 10,
    visibilityTime,
  });
}

export function normalizeString(str: string) {
  // Remove leading/trailing spaces and convert to lowercase
  return (
    str
      .trim()
      // Convert Greek uppercase to lowercase
      .toLowerCase()
      // Normalize Greek characters
      .normalize('NFKD')
      // Convert Α (Greek) to a (Latin)
      .replace(/α|ά/gi, 'a')
      // Remove any remaining diacritics
      .replace(/[\u0300-\u036f]/g, '')
  );
}

/**
 * If text is number sort by number and not string, example 1, 2, 10 and not 1, 10, 2
 */

export function naturalSort(a: string, b: string) {
  const aNorm = normalizeString(a);
  const bNorm = normalizeString(b);

  // Split into parts (letters and numbers)
  const splitPattern = /(\d+|\D+)/g;
  const aParts = aNorm.match(splitPattern) || [];
  const bParts = bNorm.match(splitPattern) || [];

  for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
    const aValue = aParts[i];
    const bValue = bParts[i];

    // If both parts are numbers
    const aNum = parseInt(aValue);
    const bNum = parseInt(bValue);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      if (aNum !== bNum) {
        return aNum - bNum;
      }
    } else {
      // Compare as strings
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
  onOK: any = () => { },
  onCancel: any = () => { },
  okTitle: string = 'OK',
  cancelTitle: string = 'Cancel'
) {
  Alert.alert(
    title, // Title of the alert
    message, // Message shown in the alert
    [
      {
        text: cancelTitle,
        onPress: onCancel, // Do nothing on cancel
        style: 'cancel',
      },
      { text: okTitle, onPress: onOK }, // Go back if OK pressed
    ],
    { cancelable: false } // Prevents the alert from being dismissed on tapping outside
  );

  return true; // This prevents the default behavior
}

export const checkInternetConnectivity = async () => {
  try {
    const state = await NetInfo.fetch();

    if (!state.isConnected || !state.isInternetReachable) {
      toast('error', 'No internet connection');
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
  // Extract the R, G, B values from the hex color
  const rgb = parseInt(hexColor.slice(1), 16); // Convert hex to integer
  const r = (rgb >> 16) & 0xff; // Extract the red value
  const g = (rgb >> 8) & 0xff; // Extract the green value
  const b = (rgb >> 0) & 0xff; // Extract the blue value

  // Calculate luminance
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  // Return black or white based on luminance
  return luminance > 128 ? colors.black : colors.white;
};
