import { useEffect, useState } from 'react';
import { readStorage, storageKeys, writeStorage } from '../utils/storage';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => readStorage(storageKeys.favorites, []));

  useEffect(() => {
    writeStorage(storageKeys.favorites, favorites);
  }, [favorites]);

  const toggleFavorite = (team: string) => {
    setFavorites((prev) =>
      prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team],
    );
  };

  return { favorites, toggleFavorite, setFavorites };
}
