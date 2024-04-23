import { NavigationProp } from '@react-navigation/native';
import dayjs, { Dayjs } from 'dayjs';
import { Alert, Button } from 'react-native';
import Toast, { ToastType } from 'react-native-toast-message';
import { Dialog, Portal, Text } from 'react-native-paper';
import { useState } from 'react';

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

export function convertDateToLocal(date: Dayjs | Date) {
  const now = new Date();
  const hoursToAdd = -now.getTimezoneOffset() / 60;

  date = dayjs(date);

  date = date.add(hoursToAdd, 'hours');

  return date;
}

export function toast(type: ToastType, title: string, text: string = '') {
  Toast.show({
    type,
    text1: title,
    text2: text,
    position: 'bottom',
    bottomOffset: 60,
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
    { cancelable: true } // Prevents the alert from being dismissed on tapping outside
  );

  return true; // This prevents the default behavior
}
