import { useState } from 'react';

const LEAGUES = [
  { code: 'PL', label: 'Premier League' },
  { code: 'PD', label: 'La Liga' },
  { code: 'BL1', label: 'Bundesliga' },
  { code: 'SA', label: 'Serie A' },
  { code: 'FL1', label: 'Ligue 1' },
];

const SOURCES = [
  { id: 'u_next_football', label: 'U-NEXTフットボール' },
  { id: 'dazn_japan', label: 'DAZN Japan' },
];

export function AdminPage() {
  const [matchId, setMatchId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [sourceId, setSourceId] = useState('u_next_football');
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState('');

  const showResult = (data: unknown) => {
    setResult(JSON.stringify(data, null, 2));
  };

  const refreshLeague = async (league: string) => {
    setLoading(`league-${league}`);
    setResult('');

    try {
      const res = await fetch(`/api/cron-monitor?league=${league}`);
      const data = await res.json();
      showResult(data);
    } catch (err) {
      setResult(String(err));
    } finally {
      setLoading(null);
    }
  };

  const saveManualHighlight = async () => {
    if (!matchId.trim() || !videoUrl.trim()) {
      setResult('Match ID and YouTube URL are required.');
      return;
    }

    setLoading('manual');
    setResult('');

    try {
      const res = await fetch('/api/admin/highlights/set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchId: matchId.trim(),
          videoUrl: videoUrl.trim(),
          sourceId,
        }),
      });

      const data = await res.json();
      showResult(data);
    } catch (err) {
      setResult(String(err));
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 text-slate-100">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      <p className="mt-2 text-sm text-slate-400">
        Manually refresh and override official highlight sources.
      </p>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <h2 className="text-lg font-semibold">Refresh by league</h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {LEAGUES.map((league) => (
            <button
              key={league.code}
              type="button"
              onClick={() => refreshLeague(league.code)}
              disabled={loading !== null}
              className="rounded-xl border border-brand-500/40 bg-brand-500/10 px-4 py-3 text-left font-semibold text-brand-400 hover:bg-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading === `league-${league.code}`
                ? 'Refreshing...'
                : `Refresh ${league.label}`}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <h2 className="text-lg font-semibold">Manual override</h2>
        <p className="mt-1 text-sm text-slate-400">
          Save a specific YouTube URL for a match. This is useful when automatic
          matching misses a video or picks the wrong one.
        </p>

        <div className="mt-4 grid gap-3">
          <input
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            placeholder="Match ID, e.g. 538130"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-brand-500"
          />

          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="YouTube URL"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-brand-500"
          />

          <select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-brand-500"
          >
            {SOURCES.map((source) => (
              <option key={source.id} value={source.id}>
                {source.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={saveManualHighlight}
            disabled={loading !== null}
            className="rounded-xl bg-brand-500 px-5 py-3 font-semibold text-slate-950 hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading === 'manual' ? 'Saving...' : 'Save manual highlight'}
          </button>
        </div>
      </section>

      {result && (
        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Result
          </h2>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm text-slate-200">
            {result}
          </pre>
        </section>
      )}
    </main>
  );
}