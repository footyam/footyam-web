import { Navigate, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { useBlindMode } from './hooks/useBlindMode';
import { useFavorites } from './hooks/useFavorites';
import { useLanguage } from './hooks/useLanguage';
import { useMatches } from './hooks/useMatches';
import { useSettings } from './hooks/useSettings';
import { useWatchHistory } from './hooks/useWatchHistory';
import { HomePage } from './pages/HomePage';
import { MatchDetailPage } from './pages/MatchDetailPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const { blindMode, setBlindMode } = useBlindMode();
  const { favorites, toggleFavorite, setFavorites } = useFavorites();
  const { defaultBlindMode, setDefaultBlindMode } = useSettings();
  const { topClubs, topLeagues, trackWatch, reset } = useWatchHistory();
  const { matches, allTeams, loading, error } = useMatches();
  const { language, setLanguage } = useLanguage();

  const resetPersonalization = () => {
    setFavorites([]);
    reset();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header blindMode={blindMode} setBlindMode={setBlindMode} />
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              blindMode={blindMode}
              favorites={favorites}
              topClubs={topClubs}
              topLeagues={topLeagues}
              matches={matches}
              loading={loading}
              error={error}
            />
          }
        />
        <Route
          path="/match/:id"
          element={<MatchDetailPage blindMode={blindMode} onWatch={trackWatch} language={language} />}
        />
        <Route
          path="/settings"
          element={
            <SettingsPage
              defaultBlindMode={defaultBlindMode}
              onSetDefaultBlindMode={setDefaultBlindMode}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onResetPersonalization={resetPersonalization}
              allTeams={allTeams}
              language={language}
              onSetLanguage={setLanguage}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
