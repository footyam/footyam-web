import { useEffect, useRef, useState } from 'react';

type Props = {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
};

export function ShareMatchButton({ matchId, homeTeam, awayTeam }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const buildUrl = () => {
    const url = new URL(`/match/${matchId}`, window.location.origin);
    url.searchParams.set('blind', '1');
    return url.toString();
  };

  const buildText = () => {
    return `Watch ${homeTeam} vs ${awayTeam} highlights spoiler-free`;
  };

  const handleShare = async () => {
    const url = buildUrl();
    const text = buildText();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FootyAM',
          text,
          url,
        });
        setOpen(false);
        return;
      } catch {}
    }

    await navigator.clipboard.writeText(`${text}\n${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopy = async () => {
    const url = buildUrl();

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
  ref={triggerRef}
  onClick={() => setOpen((prev) => !prev)}
  className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/70 text-emerald-300 transition hover:bg-emerald-400/10"
  aria-label="Share"
  title="Share"
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
    <path d="M12 3v12" />
    <path d="M7 8l5-5 5 5" />
    <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
  </svg>
</button>

      {open && (
        <div
          ref={popoverRef}
          className="absolute right-0 z-50 mt-3 w-72 rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur"
        >
          <p className="mb-1 text-sm font-semibold text-white">
            Share this match
          </p>

          <p className="mb-4 text-xs text-slate-400">
            Opens in spoiler-free mode for others.
          </p>

          <div className="space-y-2">
            <button
              onClick={handleShare}
              className="w-full rounded-xl bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-400/20"
            >
              Share spoiler-free
            </button>

            <button
              onClick={handleCopy}
              className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm text-white hover:bg-white/5"
            >
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}