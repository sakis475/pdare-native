import AsyncStorage from '@react-native-async-storage/async-storage';

export async function setStorage(key: string, value: any) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.log(error);
  }
}

export async function getStorage(key: string) {
  try {
    const item = await AsyncStorage.getItem(key);

    if (!item) {
      return null;
    }
    return JSON.parse(item);
  } catch (error) {
    console.log(error);
  }
}
