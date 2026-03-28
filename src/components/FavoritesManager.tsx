interface FavoritesManagerProps {
  allTeams: string[];
  favorites: string[];
  toggleFavorite: (team: string) => void;
}

export function FavoritesManager({ allTeams, favorites, toggleFavorite }: FavoritesManagerProps) {
  return (
    <div className="space-y-2">
      {allTeams.map((team) => {
        const active = favorites.includes(team);
        return (
          <button
            key={team}
            onClick={() => toggleFavorite(team)}
            className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm ${
              active
                ? 'border-brand-500 bg-brand-500/15 text-brand-500'
                : 'border-slate-700 bg-slate-900 text-slate-100'
            }`}
          >
            {team}
            <span>{active ? '★' : '☆'}</span>
          </button>
        );
      })}
    </div>
  );
}
