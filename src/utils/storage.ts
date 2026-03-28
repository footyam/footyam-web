export const storageKeys = {
  blindMode: 'fh_blind_mode',
  defaultBlindMode: 'fh_default_blind_mode',
  favorites: 'fh_favorite_teams',
  watchHistory: 'fh_watch_history',
  appLanguage: 'fh_app_language',
};

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}
