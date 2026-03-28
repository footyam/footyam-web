import { useMemo, useState } from 'react';
import { LeagueFilter } from '../components/LeagueFilter';
import { MatchCard } from '../components/MatchCard';
import type { Match } from '../types';
import { isMorningMatch } from '../utils/date';

interface HomePageProps {
  blindMode: boolean;
  favorites: string[];
  topClubs: string[];
  topLeagues: string[];
  matches: Match[];
  loading: boolean;
  error: string | null;
}

function byPriority(matches: Match[], favorites: string[], topClubs: string[], topLeagues: string[]) {
  const favSet = new Set(favorites);
  const clubRank = new Map(topClubs.map((club, idx) => [club, idx]));
  const leagueRank = new Map(topLeagues.map((league, idx) => [league, idx]));

  return [...matches].sort((a, b) => {
    const aFav = favSet.has(a.homeTeam) || favSet.has(a.awayTeam);
    const bFav = favSet.has(b.homeTeam) || favSet.has(b.awayTeam);
    if (aFav !== bFav) return aFav ? -1 : 1;

    const aClubScore = Math.min(clubRank.get(a.homeTeam) ?? 999, clubRank.get(a.awayTeam) ?? 999);
    const bClubScore = Math.min(clubRank.get(b.homeTeam) ?? 999, clubRank.get(b.awayTeam) ?? 999);
    if (aClubScore !== bClubScore) return aClubScore - bClubScore;

    const aLeagueScore = leagueRank.get(a.league) ?? 999;
    const bLeagueScore = leagueRank.get(b.league) ?? 999;
    if (aLeagueScore !== bLeagueScore) return aLeagueScore - bLeagueScore;

    return +new Date(b.datetime) - +new Date(a.datetime);
  });
}

export function HomePage({ blindMode, favorites, topClubs, topLeagues, matches, loading, error }: HomePageProps) {
  const [selectedLeague, setSelectedLeague] = useState<string>('All');

  const base = useMemo(
    () =>
      selectedLeague === 'All'
        ? matches
        : matches.filter((match) => match.league === selectedLeague),
    [selectedLeague, matches],
  );

  const ordered = useMemo(
    () => byPriority(base, favorites, topClubs, topLeagues),
    [base, favorites, topClubs, topLeagues],
  );

  const morningHighlights = ordered.filter((m) => m.status === 'finished' && isMorningMatch(m.datetime)).slice(0, 4);
  const favoriteMatches = ordered.filter((m) => favorites.includes(m.homeTeam) || favorites.includes(m.awayTeam)).slice(0, 4);
  const frequentMatches = ordered.filter((m) => topClubs.includes(m.homeTeam) || topClubs.includes(m.awayTeam)).slice(0, 4);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-5">
      <LeagueFilter selected={selectedLeague} onSelect={setSelectedLeague} />
      {loading && <p className="text-sm text-slate-400">Loading recent matches…</p>}
      {error && <p className="text-sm text-rose-400">{error}</p>}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">Morning Highlights</h2>
        <div className="grid gap-3">
          {morningHighlights.map((m) => <MatchCard key={m.id} match={m} blindMode={blindMode} />)}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">Favorite Clubs</h2>
        <div className="grid gap-3">
          {favoriteMatches.length ? favoriteMatches.map((m) => <MatchCard key={m.id} match={m} blindMode={blindMode} />) : <p className="text-sm text-slate-400">Pick favorites in settings to pin clubs here.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">Frequently Watched</h2>
        <div className="grid gap-3">
          {frequentMatches.length ? frequentMatches.map((m) => <MatchCard key={m.id} match={m} blindMode={blindMode} />) : <p className="text-sm text-slate-400">Start watching highlights and we will personalize this section.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">Today & Recent</h2>
        <div className="grid gap-3">
          {ordered.map((m) => <MatchCard key={m.id} match={m} blindMode={blindMode} />)}
        </div>
      </section>
    </main>
  );
}
