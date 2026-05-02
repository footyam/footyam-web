import { useMemo, useState } from 'react';
import { TEAM_SEARCH_ALIASES } from '../data/teamSearchAliases';

interface TeamSearchBoxProps {
  selectedTeam: string | null;
  onSelectTeam: (teamName: string | null) => void;
}

function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[×x]/g, ' ')
    .replace(/[【】\[\]()（）|｜:：,，.!?？・]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function TeamSearchBox({ selectedTeam, onSelectTeam }: TeamSearchBoxProps) {
  const [query, setQuery] = useState('');

  const suggestions = useMemo(() => {
    const q = normalizeSearchText(query);
    if (!q) return [];

    return TEAM_SEARCH_ALIASES
      .map((team) => {
        const names = [team.teamName, ...team.aliases];
        const normalizedNames = names.map(normalizeSearchText);

        const startsWith = normalizedNames.some((name) => name.startsWith(q));
        const includes = normalizedNames.some((name) => name.includes(q));

        if (!startsWith && !includes) return null;

        return {
          teamName: team.teamName,
          label: team.aliases[0] ?? team.teamName,
          score: startsWith ? 2 : 1,
        };
      })
      .filter(
        (team): team is { teamName: string; label: string; score: number } =>
          team !== null
      )
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.teamName.localeCompare(b.teamName);
      })
      .slice(0, q.length === 1 ? 5 : 8);
  }, [query]);

  const selectedLabel = selectedTeam
    ? TEAM_SEARCH_ALIASES.find((team) => team.teamName === selectedTeam)?.aliases[0] ??
      selectedTeam
    : null;

  return (
    <div className="relative min-w-0 flex-1 sm:max-w-xs">
      <div className="flex items-center rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-sm text-slate-200 shadow-sm transition focus-within:border-brand-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="mr-2 h-4 w-4 shrink-0 text-white/80"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20L16.65 16.65" />
        </svg>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={selectedLabel ? selectedLabel : 'Search teams'}
          className="min-w-0 flex-1 bg-transparent text-base text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />

        {(query || selectedTeam) && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              onSelectTeam(null);
            }}
            className="ml-2 rounded-full px-1 text-slate-500 transition hover:text-slate-200"
            aria-label="Clear team search"
          >
            ×
          </button>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-11 z-30 overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-xl">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.teamName}
              type="button"
              onClick={() => {
                onSelectTeam(suggestion.teamName);
                setQuery('');
              }}
              className="block w-full px-4 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-800"
            >
              <span className="font-medium">{suggestion.label}</span>
              <span className="ml-2 text-xs text-slate-500">
                {suggestion.teamName}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}