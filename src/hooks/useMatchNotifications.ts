import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';

function getStorageKey(user: User | null) {
  return user ? `footyam-match-notifications:${user.uid}` : null;
}

function readIds(key: string, suffix: string): string[] {
  try {
    const raw = localStorage.getItem(`${key}:${suffix}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeIds(key: string, suffix: string, ids: string[]) {
  localStorage.setItem(`${key}:${suffix}`, JSON.stringify(ids));
}

export function useMatchNotifications(user: User | null) {
  const [manualNotifyMatchIds, setManualNotifyMatchIds] = useState<string[]>([]);
  const [manualMutedMatchIds, setManualMutedMatchIds] = useState<string[]>([]);

  const storageKey = useMemo(() => getStorageKey(user), [user]);

  useEffect(() => {
    if (!storageKey) {
      setManualNotifyMatchIds([]);
      setManualMutedMatchIds([]);
      return;
    }

    setManualNotifyMatchIds(readIds(storageKey, 'manual-on'));
    setManualMutedMatchIds(readIds(storageKey, 'manual-off'));
  }, [storageKey]);

  const saveManualNotifyMatchIds = useCallback(
    (ids: string[]) => {
      setManualNotifyMatchIds(ids);
      if (storageKey) writeIds(storageKey, 'manual-on', ids);
    },
    [storageKey]
  );

  const saveManualMutedMatchIds = useCallback(
    (ids: string[]) => {
      setManualMutedMatchIds(ids);
      if (storageKey) writeIds(storageKey, 'manual-off', ids);
    },
    [storageKey]
  );

  // 🔥 追加：設定ON時に個別OFFリセット
  const clearMutedMatchNotifications = useCallback(() => {
    saveManualMutedMatchIds([]);
  }, [saveManualMutedMatchIds]);

  const turnOnMatchNotification = useCallback(
    (matchId: string) => {
      saveManualNotifyMatchIds(
        manualNotifyMatchIds.includes(matchId)
          ? manualNotifyMatchIds
          : [...manualNotifyMatchIds, matchId]
      );

      saveManualMutedMatchIds(
        manualMutedMatchIds.filter((id) => id !== matchId)
      );
    },
    [
      manualNotifyMatchIds,
      manualMutedMatchIds,
      saveManualNotifyMatchIds,
      saveManualMutedMatchIds,
    ]
  );

  const turnOffMatchNotification = useCallback(
    (matchId: string) => {
      saveManualMutedMatchIds(
        manualMutedMatchIds.includes(matchId)
          ? manualMutedMatchIds
          : [...manualMutedMatchIds, matchId]
      );

      saveManualNotifyMatchIds(
        manualNotifyMatchIds.filter((id) => id !== matchId)
      );
    },
    [
      manualNotifyMatchIds,
      manualMutedMatchIds,
      saveManualNotifyMatchIds,
      saveManualMutedMatchIds,
    ]
  );

  const clearAllMatchNotifications = useCallback(() => {
  saveManualNotifyMatchIds([]);
  saveManualMutedMatchIds([]);
}, [saveManualNotifyMatchIds, saveManualMutedMatchIds]);

  return {
    manualNotifyMatchIds,
    manualMutedMatchIds,
    turnOnMatchNotification,
    turnOffMatchNotification,
    clearMutedMatchNotifications, // ←追加
    clearAllMatchNotifications,
  };
}