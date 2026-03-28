import { Link } from 'react-router-dom';
import { BlindModeToggle } from './BlindModeToggle';

interface HeaderProps {
  blindMode: boolean;
  setBlindMode: (value: boolean) => void;
}

export function Header({ blindMode, setBlindMode }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold tracking-wide text-white">
          Footy<span className="text-brand-500">AM</span>
        </Link>
        <div className="flex items-center gap-2">
          <BlindModeToggle enabled={blindMode} onChange={setBlindMode} />
          <Link to="/settings" className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200">
            Settings
          </Link>
        </div>
      </div>
    </header>
  );
}
