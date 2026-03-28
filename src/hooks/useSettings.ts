import { useEffect, useState } from 'react';
import { readStorage, storageKeys, writeStorage } from '../utils/storage';

export function useSettings() {
  const [defaultBlindMode, setDefaultBlindMode] = useState<boolean>(() =>
    readStorage(storageKeys.defaultBlindMode, true),
  );

  useEffect(() => {
    writeStorage(storageKeys.defaultBlindMode, defaultBlindMode);
  }, [defaultBlindMode]);

  return { defaultBlindMode, setDefaultBlindMode };
}
