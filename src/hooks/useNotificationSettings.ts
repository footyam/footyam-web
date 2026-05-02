import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface NotificationSettings {
  enabled: boolean;
}

const defaultSettings: NotificationSettings = {
  enabled: false,
};

export function useNotificationSettings(user: User | null) {
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>(defaultSettings);

  const [notificationSettingsLoading, setNotificationSettingsLoading] =
    useState(false);

  useEffect(() => {
    if (!user) {
      setNotificationSettings(defaultSettings);
      setNotificationSettingsLoading(false);
      return;
    }

    setNotificationSettingsLoading(true);

    const userRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      const data = snapshot.data();

      setNotificationSettings({
        enabled: Boolean(data?.notificationSettings?.enabled),
      });

      setNotificationSettingsLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const setNotificationsEnabled = async (enabled: boolean) => {
    if (!user) return;

    setNotificationSettings({ enabled });

    await setDoc(
      doc(db, 'users', user.uid),
      {
        notificationSettings: {
          enabled,
        },
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  };

  return {
    notificationSettings,
    notificationSettingsLoading,
    setNotificationsEnabled,
  };
}