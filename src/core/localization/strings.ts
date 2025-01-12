import LocalizedStrings from 'react-native-localization';
import { getStorage, setStorage } from '../../storage/store';
import { DEFAULT_APP_LANGUAGE } from '../../storage/env';

import lang_el from '../locales/lang_el.json';
import lang_en from '../locales/lang_en.json';
import { NativeModules, Platform } from 'react-native';

export const strings = new LocalizedStrings({
  lang_el,
  lang_en,
});

export function getDeviceLanguage(): AppLanguage | null {
  try {
    let deviceLanguage = '';

    if (Platform.OS === 'ios') {
      deviceLanguage =
        NativeModules.SettingsManager?.settings?.AppleLocale ||
        NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] ||
        '';
    } else {
      deviceLanguage = NativeModules.I18nManager?.localeIdentifier || '';
    }

    const languageCode = deviceLanguage.toLowerCase().split(/[-_]/)[0];

    // Only return if it matches a supported language
    switch (languageCode) {
      case 'el':
        return 'lang_el';
      default:
        return null;
    }
  } catch (error) {
    console.warn('Error detecting device language:', error);
    return null;
  }
}

export async function getLanguage() {
  const appLanguage = await getStorage('app_language');
  if (!appLanguage) {
    const deviceLanguage = getDeviceLanguage();
    const defaultLanguage = deviceLanguage || DEFAULT_APP_LANGUAGE;
    await setStorage('app_language', defaultLanguage);

    return defaultLanguage;
  }
  return appLanguage;
}

export async function setLanguage(language: AppLanguage) {
  await setStorage('app_language', language);
}

export async function setLocalizedStrings() {
  const appLanguage = await getLanguage();
  strings.setLanguage(appLanguage);
}

export type AppLanguage = 'lang_el' | 'lang_en';
