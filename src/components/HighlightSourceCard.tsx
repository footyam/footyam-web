import type { HighlightSource } from '../types';

interface HighlightSourceCardProps {
  source: HighlightSource;
  blindMode: boolean;
  onWatch: () => void;
}

const blindLabels = ['Official Highlights', 'Match Highlights', 'League Official Video'];

export function HighlightSourceCard({ source, blindMode, onWatch }: HighlightSourceCardProps) {
  const title = blindMode
    ? blindLabels[source.sourceName.length % blindLabels.length]
    : source.sourceName;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-semibold text-white">{title}</p>
        {source.isOfficial && (
          <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-xs text-brand-500">Official</span>
        )}
      </div>
      <p className="mb-3 text-xs uppercase text-slate-400">
        {blindMode ? 'official source' : source.sourceType}
      </p>
      <a
        href={source.url}
        target="_blank"
        rel="noreferrer"
        onClick={onWatch}
        className="inline-flex rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900"
      >
        Open Official Source
      </a>
    </div>
  );
}
