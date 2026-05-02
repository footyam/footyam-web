import { useMemo, useState } from 'react';
import { TEAM_SEARCH_ALIASES } from '../data/teamSearchAliases';

interface FavoritesManagerProps {
  allTeams: string[];
  favorites: string[];
  toggleFavorite: (team: string) => void;
}

function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[×x]/g, ' ')
    .replace(/[【】\[\]()（）|｜:：,，.!?？・]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function FavoritesManager({ allTeams, favorites, toggleFavorite }: FavoritesManagerProps) {
  const [query, setQuery] = useState('');

  const filteredTeams = useMemo(() => {
    const q = normalizeSearchText(query);

    if (!q) {
      return allTeams.map((teamName) => ({
        teamName,
        label:
          TEAM_SEARCH_ALIASES.find((team) => team.teamName === teamName)?.aliases[0] ??
          teamName,
      }));
    }

    return allTeams
      .map((teamName) => {
        const aliasData = TEAM_SEARCH_ALIASES.find((team) => team.teamName === teamName);
        const names = aliasData ? [aliasData.teamName, ...aliasData.aliases] : [teamName];
        const normalizedNames = names.map(normalizeSearchText);

        const startsWith = normalizedNames.some((name) => name.startsWith(q));
        const includes = normalizedNames.some((name) => name.includes(q));

        if (!startsWith && !includes) return null;

        return {
          teamName,
          label: aliasData?.aliases[0] ?? teamName,
          score: startsWith ? 2 : 1,
        };
      })
      .filter((team): team is { teamName: string; label: string; score: number } => team !== null)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.teamName.localeCompare(b.teamName);
      });
  }, [allTeams, query]);

  return (
    <div className="space-y-3">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search clubs..."
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
      />

      <div className="space-y-2">
        {filteredTeams.map((team) => {
          const active = favorites.includes(team.teamName);

          return (
            <button
              key={team.teamName}
              type="button"
              onClick={() => toggleFavorite(team.teamName)}
              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                active
                  ? 'border-brand-500 bg-brand-500/15 text-brand-500'
                  : 'border-slate-700 bg-slate-900 text-slate-100'
              }`}
            >
              <span>
                <span>{team.label}</span>
                {team.label !== team.teamName && (
                  <span className="ml-2 text-xs text-slate-500">{team.teamName}</span>
                )}
              </span>
              <span>{active ? '★' : '☆'}</span>
            </button>
          );
        })}

        {filteredTeams.length === 0 && (
          <p className="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-3 text-sm text-slate-400">
            No clubs found.
          </p>
        )}
      </div>
    </div>
  );
}