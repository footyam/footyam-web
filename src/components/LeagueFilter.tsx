import { LEAGUES } from '../data/leagues';

interface LeagueFilterProps {
  selected: string;
  onSelect: (league: string) => void;
}

export function LeagueFilter({ selected, onSelect }: LeagueFilterProps) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1">
      <div className="flex gap-2">
        {LEAGUES.map((league) => (
          <button
            key={league}
            onClick={() => onSelect(league)}
            className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs transition ${
              selected === league
                ? 'border-brand-500 bg-brand-500/20 text-brand-500'
                : 'border-slate-700 bg-slate-900 text-slate-200'
            }`}
          >
            {league}
          </button>
        ))}
      </div>
    </div>
  );
}
