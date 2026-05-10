import { useEffect, useMemo, useState } from 'react';
import type { Match } from '../types';
import { fetchRecentMatches } from '../utils/api';

const RETRY_DELAYS_MS = [0, 2000, 5000];

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Loading matches...');

  useEffect(() => {
    let cancelled = false;

    async function loadMatches() {
      setLoading(true);
      setError(null);

      for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt += 1) {
        const delay = RETRY_DELAYS_MS[attempt];

        if (delay > 0) {
          if (!cancelled) {
            setLoadingMessage(
              attempt === 1
                ? 'Still waking up the server...'
                : 'Retrying matches...'
            );
          }

          await wait(delay);
        }

        try {
          const data = await fetchRecentMatches();

          if (!cancelled) {
            setMatches(data);
            setError(null);
            setLoading(false);
          }

          return;
        } catch {
          if (!cancelled) {
            setLoadingMessage('Still waking up the server...');
          }
        }
      }

      if (!cancelled) {
        setError('Could not load matches. Please try again.');
        setLoading(false);
      }
    }

    loadMatches();

    return () => {
      cancelled = true;
    };
  }, []);

  const allTeams = useMemo(
    () => Array.from(new Set(matches.flatMap((m) => [m.homeTeam, m.awayTeam]))).sort(),
    [matches],
  );

  return { matches, allTeams, loading, error, loadingMessage };
}