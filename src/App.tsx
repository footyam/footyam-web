import { useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { useAuth } from './hooks/useAuth';
import { useBlindMode } from './hooks/useBlindMode';
import { useCloudFavorites } from './hooks/useCloudFavorites';
import { useFavorites } from './hooks/useFavorites';
import { useMatchNotifications } from './hooks/useMatchNotifications';
import { useMatches } from './hooks/useMatches';
import { useNotificationSettings } from './hooks/useNotificationSettings';
import { useWatchHistory } from './hooks/useWatchHistory';
import { HomePage } from './pages/HomePage';
import { MatchDetailPage } from './pages/MatchDetailPage';
import { SettingsPage } from './pages/SettingsPage';
import { SignInPage } from './pages/SignInPage';
import { useNotifications } from './hooks/useNotifications';

export default function App() {
  const { blindMode, setBlindMode } = useBlindMode();
  const { favorites, toggleFavorite } = useFavorites();
  const { topClubs, topLeagues, trackWatch } = useWatchHistory();
  const { matches, allTeams, loading, error } = useMatches();
  const { user, logout } = useAuth();

  const { cloudFavorites, toggleCloudFavorite } = useCloudFavorites(user);
  const {
    notificationSettings,
    setNotificationsEnabled: originalSetNotificationsEnabled,
  } = useNotificationSettings(user);

  const { notifications } = useNotifications();
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());
  const [newNotificationIds, setNewNotificationIds] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('footyam-dismissed-notifications');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const {
    manualNotifyMatchIds,
    manualMutedMatchIds,
    turnOnMatchNotification,
    turnOffMatchNotification,
    clearMutedMatchNotifications,
    clearAllMatchNotifications,
  } = useMatchNotifications(user);

  const setNotificationsEnabled = (enabled: boolean) => {
    if (enabled) {
      clearMutedMatchNotifications();
    } else {
      clearAllMatchNotifications();
    }

    originalSetNotificationsEnabled(enabled);
  };

  useEffect(() => {
    if (notifications.length === 0) return;

    const seen = seenNotificationIdsRef.current;

    if (seen.size === 0) {
      notifications.forEach((n) => seen.add(n.id));
      return;
    }

    const freshIds = notifications
      .filter((n) => !seen.has(n.id))
      .map((n) => n.id);

    if (freshIds.length > 0) {
      freshIds.forEach((id) => seen.add(id));
      setNewNotificationIds((ids) => [...freshIds, ...ids]);
    }
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(
      'footyam-dismissed-notifications',
      JSON.stringify(dismissedNotificationIds),
    );
  }, [dismissedNotificationIds]);

  const activeFavorites = user ? cloudFavorites : favorites;
  const activeToggleFavorite = user ? toggleCloudFavorite : toggleFavorite;

  const filteredNotifications = notifications.filter((n) => {
    if (!newNotificationIds.includes(n.id)) return false;
    if (dismissedNotificationIds.includes(n.id)) return false;

    const isFavoriteMatch =
      activeFavorites.includes(n.homeTeam) ||
      activeFavorites.includes(n.awayTeam);

    const isManuallyOn = manualNotifyMatchIds.includes(n.matchId);
    const isManuallyOff = manualMutedMatchIds.includes(n.matchId);

    if (isManuallyOff) return false;
    if (isManuallyOn) return true;

    if (!notificationSettings?.enabled) return false;
    if (isFavoriteMatch) return true;

    return false;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header
        blindMode={blindMode}
        setBlindMode={setBlindMode}
        selectedTeam={selectedTeam}
        onSelectTeam={setSelectedTeam}
      />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              blindMode={blindMode}
              favorites={activeFavorites}
              topClubs={topClubs}
              topLeagues={topLeagues}
              matches={matches}
              loading={loading}
              error={error}
              selectedTeam={selectedTeam}
              onSelectTeam={setSelectedTeam}
              isSignedIn={Boolean(user)}
            />
          }
        />

        <Route
          path="/match/:id"
          element={
            <MatchDetailPage
              blindMode={blindMode}
              onWatch={trackWatch}
              favorites={activeFavorites}
              notificationSettings={notificationSettings}
              manualNotifyMatchIds={manualNotifyMatchIds}
              manualMutedMatchIds={manualMutedMatchIds}
              onTurnOnMatchNotification={turnOnMatchNotification}
              onTurnOffMatchNotification={turnOffMatchNotification}
              user={user}
            />
          }
        />

        <Route
          path="/settings"
          element={
            <SettingsPage
  blindMode={blindMode}
  onSetBlindMode={setBlindMode}
  favorites={activeFavorites}
  toggleFavorite={activeToggleFavorite}
  allTeams={allTeams}
  user={user}
  onLogout={logout}
  notificationSettings={notificationSettings}
  onSetNotificationsEnabled={setNotificationsEnabled}
/>
          }
        />

        <Route path="/signin" element={<SignInPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {filteredNotifications.slice(0, 3).map((n) => (
          <div
            key={n.id}
            className="relative w-80 rounded-xl border border-brand-500/40 bg-slate-900 p-4 pr-10 text-sm shadow-lg"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDismissedNotificationIds((ids) =>
                  ids.includes(n.id) ? ids : [...ids, n.id],
                );
              }}
              className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-slate-600 text-slate-300 hover:border-brand-500 hover:text-brand-500"
              aria-label="Close notification"
            >
              ×
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.href = `/match/${n.matchId}`;
              }}
              className="block w-full pt-5 text-left"
            >
              <p className="font-semibold text-white">
                {n.homeTeam} vs {n.awayTeam}
              </p>
              <p className="mt-1 text-xs text-slate-400">{n.sourceName}</p>
              <p className="mt-2 text-xs text-brand-500">▶ Watch Highlights</p>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}