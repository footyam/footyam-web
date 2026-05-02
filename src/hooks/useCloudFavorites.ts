import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from '../lib/firebase';

export function useCloudFavorites(user: User | null) {
  const [cloudFavorites, setCloudFavorites] = useState<string[]>([]);
  const [cloudFavoritesLoading, setCloudFavoritesLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setCloudFavorites([]);
      setCloudFavoritesLoading(false);
      return;
    }

    setCloudFavoritesLoading(true);

    const userRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      const data = snapshot.data();
      setCloudFavorites(Array.isArray(data?.favorites) ? data.favorites : []);
      setCloudFavoritesLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const toggleCloudFavorite = async (team: string) => {
    if (!user) return;

    const nextFavorites = cloudFavorites.includes(team)
      ? cloudFavorites.filter((favorite) => favorite !== team)
      : [...cloudFavorites, team];

    setCloudFavorites(nextFavorites);

    await setDoc(
      doc(db, 'users', user.uid),
      {
        favorites: nextFavorites,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  };

  return {
    cloudFavorites,
    cloudFavoritesLoading,
    toggleCloudFavorite,
  };
}