import LocalizedStrings from 'react-native-localization';
import { getStorage, setStorage } from '../../storage/store';
import { DEFAULT_APP_LANGUAGE } from '../../storage/env';

import lang_el from '../locales/lang_el.json';
import lang_en from '../locales/lang_en.json';

export const strings = new LocalizedStrings({
  lang_el,
  lang_en,
});

export async function getLanguage() {
  const appLanguage = await getStorage('app_language');
  if (!appLanguage) {
    await setStorage('app_language', DEFAULT_APP_LANGUAGE);
    return DEFAULT_APP_LANGUAGE;
  }
  return appLanguage;
}

export async function setLanguage(language: AppLanguage) {
  await setStorage('app_language', language);
}

export async function setLocalizedStrings() {
  const appLanguage = await getLanguage();
  console.log(appLanguage, 'appLanguage');
  strings.setLanguage(appLanguage);
}

export type AppLanguage = 'lang_el' | 'lang_en';
