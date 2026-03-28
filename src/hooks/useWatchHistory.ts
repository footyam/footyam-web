import { useEffect, useMemo, useState } from 'react';
import { readStorage, storageKeys, writeStorage } from '../utils/storage';

type WatchHistory = {
  clubs: Record<string, number>;
  leagues: Record<string, number>;
};

const fallback: WatchHistory = { clubs: {}, leagues: {} };

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistory>(() => readStorage(storageKeys.watchHistory, fallback));

  useEffect(() => {
    writeStorage(storageKeys.watchHistory, history);
  }, [history]);

  const trackWatch = (homeTeam: string, awayTeam: string, league: string) => {
    setHistory((prev) => ({
      clubs: {
        ...prev.clubs,
        [homeTeam]: (prev.clubs[homeTeam] ?? 0) + 1,
        [awayTeam]: (prev.clubs[awayTeam] ?? 0) + 1,
      },
      leagues: {
        ...prev.leagues,
        [league]: (prev.leagues[league] ?? 0) + 1,
      },
    }));
  };

  const topClubs = useMemo(
    () => Object.entries(history.clubs).sort((a, b) => b[1] - a[1]).map(([club]) => club),
    [history.clubs],
  );

  const topLeagues = useMemo(
    () => Object.entries(history.leagues).sort((a, b) => b[1] - a[1]).map(([league]) => league),
    [history.leagues],
  );

  const reset = () => setHistory(fallback);

  return { history, topClubs, topLeagues, trackWatch, reset };
}
