import { useEffect, useState } from 'react';
import { readStorage, storageKeys, writeStorage } from '../utils/storage';

export function useBlindMode() {
  const [blindMode, setBlindMode] = useState<boolean>(() => {
    const defaultBlind = readStorage(storageKeys.defaultBlindMode, true);
    return readStorage(storageKeys.blindMode, defaultBlind);
  });

  useEffect(() => {
    writeStorage(storageKeys.blindMode, blindMode);
  }, [blindMode]);

  return { blindMode, setBlindMode };
}
