import { useEffect, useState } from 'react';
import { readStorage, storageKeys, writeStorage } from '../utils/storage';

export type AppLanguage = 'ja' | 'en';

export function useLanguage() {
  const [language, setLanguage] = useState<AppLanguage>(() =>
    readStorage<AppLanguage>(storageKeys.appLanguage, 'ja'),
  );

  useEffect(() => {
    writeStorage(storageKeys.appLanguage, language);
  }, [language]);

  return { language, setLanguage };
}
