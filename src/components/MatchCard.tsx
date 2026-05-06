import { Link } from 'react-router-dom';
import type { Match } from '../types';
import { formatDateTime } from '../utils/date';
import { trackEvent } from '../utils/analytics';

interface MatchCardProps {
  match: Match;
  blindMode: boolean;
}

function formatStatus(status: string) {
  if (status === 'finished') return 'Finished';
  if (status === 'upcoming') return 'Upcoming';
  return status;
}

export function MatchCard({ match, blindMode }: MatchCardProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
        <span>{match.league}</span>
        <span className="rounded-full bg-slate-800 px-2 py-0.5 uppercase">
          {formatStatus(match.status)}
        </span>
      </div>

      <p className="text-sm text-slate-300">
        {formatDateTime(match.datetime)}
      </p>

      <h3 className="mt-2 text-base font-semibold text-white">
        {match.homeTeam} vs {match.awayTeam}
      </h3>

      <p className="mt-1 text-sm text-slate-300">
        {blindMode || !match.score
          ? 'Hidden'
          : `${match.score.home} - ${match.score.away}`}
      </p>

      <Link
        to={`/match/${match.id}`}
        onClick={() => {
          trackEvent('highlight_click', {
            location: 'home',
            match_id: match.id,
            home_team: match.homeTeam,
            away_team: match.awayTeam,
            league: match.league,
            source: 'match_card',
            blind_mode: blindMode,
          });
        }}
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-brand-500"
      >
        ▶ Watch Highlights
      </Link>
    </article>
  );
}