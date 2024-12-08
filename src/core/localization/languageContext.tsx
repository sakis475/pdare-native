// languageContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { setLocalizedStrings, strings } from '../strings';
import { getStorage } from '../../storage/store';
import { EventEmitter } from '../../helpers/Sockets/EventEmitter';

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
    // Set up event listener for language changes if you have one
    EventEmitter.addListener('LANGUAGE_CHANGED', languageChangeListener);

    return () => {
      // EventEmitter.removeListener('LANGUAGE_CHANGED', languageChangeListener);
    };
  }, []);

  return <LanguageContext.Provider value={stringsState}>{children}</LanguageContext.Provider>;
};

export const useStrings = () => useContext(LanguageContext);
