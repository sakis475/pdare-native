import { Alert } from 'react-native';
import Toast, { ToastType } from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';
import { colors } from './theme';

export const emailValidator = (email: string) => {
  const re = /\S+@\S+\.\S+/;

  if (!email || email.length <= 0) return 'Email cannot be empty.';
  if (!re.test(email)) return 'Ooops! We need a valid email address.';

  return '';
};

export const passwordValidator = (password: string) => {
  if (!password || password.length <= 0) return 'Password cannot be empty.';

  return '';
};

export const nameValidator = (name: string) => {
  if (!name || name.length <= 0) return 'Name cannot be empty.';

  return '';
};

export function toast(type: ToastType, title: string, text: string = '', visibilityTime = 4000) {
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
/**
 * If text is number sort by number and not string, example 1, 2, 10 and not 1, 10, 2
 */
export function sortNumberAndStrings(a: any, b: any, ascending = true) {
  const typeA = typeof a;
  const typeB = typeof b;

  const ascendingMultiplier = ascending === true ? 1 : -1;

  // Handle numeric types first (numbers and strings representing numbers)
  if (typeA === 'number' || !isNaN(Number(a))) {
    const numA = Number(a);
    if (typeB === 'number' || !isNaN(Number(b))) {
      const numB = Number(b);
      return (numA - numB) * ascendingMultiplier; // Sort numbers in ascending order
    } else {
      return -1 * ascendingMultiplier; // Numbers come before strings
    }
  } else if (typeB === 'number' || !isNaN(Number(b))) {
    return 1 * ascendingMultiplier; // Strings representing numbers come after numbers
  }

  const compare = ascendingMultiplier * a.localeCompare(b);
  return compare;
}

export function normalizeGreek(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function AlertWithOptions(
  title: string,
  message: string,
  onOK: any,
  onCancel: any,
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

export const checkInternetConnectivity = () => {
  try {
    NetInfo.fetch().then((state) => {
      if (!state.isConnected || !state.isInternetReachable) {
        toast('error', 'No internet connection');
      }
    });
  } catch (error) {
    console.log('NetInfo failed', error);
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
