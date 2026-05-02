import { useNavigate } from 'react-router-dom';
import type { User } from 'firebase/auth';
import { FavoritesManager } from '../components/FavoritesManager';
import { ENABLE_ACCOUNT_FEATURES } from '../config/features';

interface NotificationSettings {
  enabled: boolean;
}

interface SettingsPageProps {
  blindMode: boolean;
  onSetBlindMode: (value: boolean) => void;
  favorites: string[];
  toggleFavorite: (team: string) => void;
  allTeams: string[];
  user: User | null;
  onLogout: () => void;
  notificationSettings: NotificationSettings;
  onSetNotificationsEnabled: (enabled: boolean) => void;
}

export function SettingsPage({
  blindMode,
  onSetBlindMode,
  favorites,
  toggleFavorite,
  allTeams,
  user,
  onLogout,
  notificationSettings,
  onSetNotificationsEnabled,
}: SettingsPageProps) {

  const navigate = useNavigate();
  const isSignedIn = Boolean(user);

  return (
    <main className="mx-auto max-w-5xl space-y-5 px-4 py-5">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="inline-flex items-center gap-2 text-lg font-semibold text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
                <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.8 1.8 0 0 0 15 19.4a1.8 1.8 0 0 0-1 .6 1.8 1.8 0 0 0-.5 1.3V21a2 2 0 1 1-4 0v-.09A1.8 1.8 0 0 0 8.4 19.4a1.8 1.8 0 0 0-1.98.36l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-.6-1 1.8 1.8 0 0 0-1.3-.5H2.6a2 2 0 1 1 0-4h.09A1.8 1.8 0 0 0 4.6 8.4a1.8 1.8 0 0 0-.36-1.98l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.8 1.8 0 0 0 9 4.6a1.8 1.8 0 0 0 1-.6 1.8 1.8 0 0 0 .5-1.3V2.6a2 2 0 1 1 4 0v.09A1.8 1.8 0 0 0 15.6 4.6a1.8 1.8 0 0 0 1.98-.36l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.8 1.8 0 0 0 19.4 9c.3.2.6.4 1 .6.4.2.8.2 1.3.2h.1a2 2 0 1 1 0 4h-.1a1.8 1.8 0 0 0-1.3.5 1.8 1.8 0 0 0-1 .7Z" />
              </svg>
              Settings
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Adjust spoiler protection, favorites, and notifications.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full border border-slate-700 p-2 text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
            aria-label="Close settings"
          >
            ×
          </button>
        </div>
      </section>

      {ENABLE_ACCOUNT_FEATURES && (
        <section className="rounded-2xl border border-brand-500/40 bg-gradient-to-br from-brand-500/15 to-slate-900 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-500">FootyAM Account</p>
              <h2 className="mt-1 text-lg font-bold text-white">
                {isSignedIn ? 'Signed in' : 'Sign in for a better experience'}
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                {isSignedIn
                  ? `${user?.displayName ?? 'User'} / ${user?.email ?? ''}`
                  : 'Save favorites, sync settings, and receive highlight notifications.'}
              </p>
            </div>

            {isSignedIn ? (
              <button
                type="button"
                onClick={onLogout}
                className="rounded-full border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-rose-500 hover:text-rose-300"
              >
                Sign out
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/signin')}
                className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110"
              >
                Sign in
              </button>
            )}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
          Blind Mode Defaults
        </h2>
       <button
  type="button"
  onClick={() => onSetBlindMode(!blindMode)}
  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
    blindMode
      ? 'border border-brand-500 bg-brand-500/20 text-brand-500'
      : 'border border-slate-600 bg-slate-800 text-slate-200'
  }`}
>
  Blind Mode: {blindMode ? 'ON' : 'OFF'}
</button>
      </section>

      {ENABLE_ACCOUNT_FEATURES && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                Highlight Notifications
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {isSignedIn
                  ? 'Get notified when highlights are found for your favorite clubs.'
                  : 'Sign in to receive highlight notifications for your favorite clubs.'}
              </p>
            </div>

            {isSignedIn ? (
              <button
                type="button"
                onClick={() => onSetNotificationsEnabled(!notificationSettings.enabled)}
                aria-label={
                  notificationSettings.enabled
                    ? 'Turn off highlight notifications'
                    : 'Turn on highlight notifications'
                }
                className={`relative h-8 w-14 rounded-full transition ${
                  notificationSettings.enabled
                    ? 'bg-brand-500'
                    : 'border border-brand-500 bg-slate-900'
                }`}
              >
                <span
                  className={`absolute top-1 flex h-6 w-6 items-center justify-center rounded-full transition ${
                    notificationSettings.enabled
                      ? 'right-1 bg-white'
                      : 'left-1 bg-brand-500'
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={notificationSettings.enabled ? '#10b981' : 'white'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/signin')}
                className="rounded-full border border-brand-500 px-4 py-2 text-sm font-semibold text-brand-500 transition hover:bg-brand-500/10"
              >
                Sign in
              </button>
            )}
          </div>
        </section>
      )}

      {ENABLE_ACCOUNT_FEATURES &&
        (isSignedIn ? (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
              Favorite Clubs
            </h2>
            <FavoritesManager
              allTeams={allTeams}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
            />
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Favorite Clubs
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Sign in to add and manage your favorite clubs.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/signin')}
                className="rounded-full border border-brand-500 px-4 py-2 text-sm font-semibold text-brand-500 transition hover:bg-brand-500/10"
              >
                Sign in
              </button>
            </div>
          </section>
        ))}
    </main>
  );
}