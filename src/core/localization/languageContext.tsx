// languageContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { setLocalizedStrings, strings } from './strings';
import { getStorage } from '../../storage/store';
import { EventEmitter, LANGUAGE_CHANGED } from '../../helpers/Sockets/EventEmitter';

const LanguageContext = createContext(strings);

export const LanguageProvider = ({ children }: any) => {
  const [stringsState, setStringsState] = useState(strings);

  useEffect(() => {
    const initLanguage = async () => {
      await setLocalizedStrings();
      setStringsState({ ...strings });
    };

    // Listen to language changes
    const languageChangeListener = async () => {
      const language = await getStorage('app_language');
      await setLocalizedStrings();
      setStringsState({ ...strings });
    };

    initLanguage();

    const subscription = EventEmitter.addListener(LANGUAGE_CHANGED, languageChangeListener);
    return () => subscription.remove();
  }, []);

  return <LanguageContext.Provider value={stringsState}>{children}</LanguageContext.Provider>;
};

export const useStrings = () => useContext(LanguageContext);
