import { Link } from 'react-router-dom';
import { BlindModeToggle } from './BlindModeToggle';
import { TeamSearchBox } from './TeamSearchBox';

interface HeaderProps {
  blindMode: boolean;
  setBlindMode: (value: boolean) => void;
  selectedTeam: string | null;
  onSelectTeam: (teamName: string | null) => void;
}

export function Header({ blindMode, setBlindMode, selectedTeam, onSelectTeam }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Link to="/" className="shrink-0 text-lg font-bold tracking-wide text-white">
          Footy<span className="text-brand-500">AM</span>
        </Link>

        <TeamSearchBox selectedTeam={selectedTeam} onSelectTeam={onSelectTeam} />

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <BlindModeToggle enabled={blindMode} onChange={setBlindMode} />

          <Link
            to="/settings"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-200 transition hover:border-brand-500 hover:bg-slate-900 hover:text-brand-500"
            aria-label="設定"
            title="設定"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.05.05a2 2 0 1 1-2.83 2.83l-.05-.05A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.39 1.1V21a2 2 0 1 1-4 0v-.08A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.88.34l-.05.05a2 2 0 1 1-2.83-2.83l.05-.05A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.39H3a2 2 0 1 1 0-4h.08A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.05-.05a2 2 0 1 1 2.83-2.83l.05.05A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .39-1.1V3a2 2 0 1 1 4 0v.08A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.88-.34l.05-.05a2 2 0 1 1 2.83 2.83l-.05.05A1.7 1.7 0 0 0 19.4 9c.15.38.38.72.6 1 .31.28.7.42 1.1.39H21a2 2 0 1 1 0 4h-.08A1.7 1.7 0 0 0 19.4 15Z" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}