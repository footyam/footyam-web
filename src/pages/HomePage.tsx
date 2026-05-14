import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LeagueFilter } from '../components/LeagueFilter';
import { MatchCard } from '../components/MatchCard';
import { ENABLE_ACCOUNT_FEATURES } from '../config/features';
import type { Match } from '../types';

interface HomePageProps {
  blindMode: boolean;
  favorites: string[];
  topClubs: string[];
  topLeagues: string[];
  matches: Match[];
  loading: boolean;
  error: string | null;
  selectedTeam: string | null;
  onSelectTeam: (teamName: string | null) => void;
  isSignedIn: boolean;
}

const leagueAliases: Record<string, string[]> = {
  'Premier League': ['premier league'],
  'La Liga': ['la liga', 'laliga', 'primera división', 'primera division'],
  Bundesliga: ['bundesliga'],
  'Serie A': ['serie a'],
  'Ligue 1': ['ligue 1', 'ligue one'],
  International: [
    'international',
    'uefa',
    'fifa',
    'world cup',
    'euro',
    'nations league',
    'champions league',
    'europa',
    'conference league',
  ],
  //'J League': ['j league', 'j1 league', 'jリーグ'],
};

function matchesLeagueFilter(matchLeague: string, selectedLeague: string): boolean {
  if (selectedLeague === 'All') return true;

  const normalizedLeague = matchLeague.toLowerCase();
  const aliases = leagueAliases[selectedLeague] ?? [selectedLeague.toLowerCase()];

  return aliases.some((alias) => normalizedLeague.includes(alias));
}

function byRecent(matches: Match[]) {
  return [...matches].sort(
    (a, b) => +new Date(b.datetime) - +new Date(a.datetime)
  );
}

function getMorningWindow() {
  const now = new Date();

  const end = new Date(now);
  end.setHours(19, 0, 0, 0);

  const start = new Date(end);
  start.setDate(start.getDate() - 1);

  if (now.getHours() >= 19) {
    end.setDate(end.getDate() + 1);
    start.setDate(start.getDate() + 1);
  }

  return { start, end };
}

function isInMorningWindow(datetime: string) {
  const matchDate = new Date(datetime);
  const { start, end } = getMorningWindow();

  return matchDate >= start && matchDate < end;
}

export function HomePage({
  blindMode,
  favorites,
  matches,
  loading,
  error,
  selectedTeam,
  isSignedIn,
}: HomePageProps) {
  const navigate = useNavigate();
  const [selectedLeague, setSelectedLeague] = useState<string>('All');

  const base = useMemo(
    () =>
      matches.filter((match) => {
        const leagueOk = matchesLeagueFilter(match.league, selectedLeague);

        const teamOk =
          !selectedTeam ||
          match.homeTeam === selectedTeam ||
          match.awayTeam === selectedTeam;

        return leagueOk && teamOk;
      }),
    [selectedLeague, matches, selectedTeam]
  );

  const ordered = useMemo(() => byRecent(base), [base]);

  const favoriteMatches = ordered
    .filter(
      (match) =>
        favorites.includes(match.homeTeam) ||
        favorites.includes(match.awayTeam)
    )
    .slice(0, 6);

  const nonFavoriteMatches = ordered.filter(
    (match) =>
      !favorites.includes(match.homeTeam) &&
      !favorites.includes(match.awayTeam)
  );

  const morningHighlights = nonFavoriteMatches
    .filter(
      (match) =>
        match.status === 'finished' &&
        isInMorningWindow(match.datetime)
    )
    .slice(0, 8);

  const recentMatches = ordered.filter(
  (match) =>
    !isInMorningWindow(match.datetime) ||
    match.status !== 'finished'
);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-5">
      <LeagueFilter selected={selectedLeague} onSelect={setSelectedLeague} />

      {loading && (
        <p className="text-sm text-slate-400">Loading recent matches...</p>
      )}

      {error && <p className="text-sm text-rose-400">{error}</p>}

      {ENABLE_ACCOUNT_FEATURES && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
            Favorite Clubs
          </h2>

          <div className="grid gap-3">
            {!isSignedIn ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <p className="text-sm text-slate-400">
                  Sign in to add favorite clubs
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/signin')}
                  className="w-fit rounded-full border border-brand-500 px-4 py-2 text-sm font-semibold text-brand-500 transition hover:bg-brand-500/10"
                >
                  Sign in
                </button>
              </div>
            ) : favorites.length === 0 ? (
              <p className="text-sm text-slate-400">
                Add your favorite clubs
              </p>
            ) : favoriteMatches.length ? (
              favoriteMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  blindMode={blindMode}
                />
              ))
            ) : (
              <p className="text-sm text-slate-400">No matches found</p>
            )}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
          Morning Highlights
        </h2>

        <div className="grid gap-3">
          {morningHighlights.length ? (
            morningHighlights.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                blindMode={blindMode}
              />
            ))
          ) : (
            <p className="text-sm text-slate-400">
              No highlights yet from last night
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
          Recent Matches
        </h2>

        <div className="grid gap-3">
          {recentMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              blindMode={blindMode}
            />
          ))}
        </div>
      </section>
    </main>
  );
}