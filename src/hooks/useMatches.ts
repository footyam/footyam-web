import { useEffect, useMemo, useState } from 'react';
import type { Match } from '../types';
import { fetchRecentMatches } from '../utils/api';

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchRecentMatches()
      .then((data) => {
        if (!cancelled) {
          setMatches(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load matches');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const allTeams = useMemo(
    () => Array.from(new Set(matches.flatMap((m) => [m.homeTeam, m.awayTeam]))).sort(),
    [matches],
  );

  return { matches, allTeams, loading, error };
}
