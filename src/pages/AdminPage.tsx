import { useState } from 'react';


const SOURCES = [
  { id: 'u_next_football', label: 'U-NEXTフットボール' },
  { id: 'dazn_japan', label: 'DAZN Japan' },
];

export function AdminPage() {
  const [adminSecret, setAdminSecret] = useState('');
  const [matchId, setMatchId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [sourceId, setSourceId] = useState('u_next_football');
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState('');

  const showResult = (data: unknown) => {
    setResult(JSON.stringify(data, null, 2));
  };


const saveManualHighlight = async () => {
  if (!matchId.trim() || !videoUrl.trim()) {
    setResult('Failed: Match ID and YouTube URL are required.');
    return;
  }

  if (!matchId.trim() || !videoUrl.trim()) {
    setResult('Failed: Match ID and YouTube URL are required.');
    return;
  }

  setLoading('manual');
  setResult('');

  try {
    const res = await fetch('/api/admin/highlights/set', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': adminSecret,
      },
      body: JSON.stringify({
        matchId: matchId.trim(),
        videoUrl: videoUrl.trim(),
        sourceId,
      }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      setResult(`Failed:\n${JSON.stringify(data, null, 2)}`);
      return;
    }

    setResult(`Saved!\n${JSON.stringify(data, null, 2)}`);
  } catch (err) {
    setResult(`Failed:\n${String(err)}`);
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
      <div className="mt-6">
  <input
    type="password"
    value={adminSecret}
    onChange={(e) => setAdminSecret(e.target.value)}
    placeholder="Admin secret"
    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-brand-500"
  />
</div>

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
