import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { AppLanguage } from '../hooks/useLanguage';
import type { HighlightSourceOption, Match } from '../types';
import { fetchHighlightSources, fetchMatchById } from '../utils/api';
import { formatDateTime } from '../utils/date';

interface MatchDetailPageProps {
  blindMode: boolean;
  onWatch: (homeTeam: string, awayTeam: string, league: string) => void;
  language: AppLanguage;
}

const sourcePriorityByLanguage: Record<AppLanguage, Record<string, string[]>> = {
  ja: {
    'Premier League': ['U-NEXTフットボール', 'U-NEXT', 'DAZN Japan', 'DAZN', 'Premier League'],
    'La Liga': ['U-NEXTフットボール', 'DAZN Japan', 'DAZN', 'LaLiga'],
    Bundesliga: ['DAZN Japan', 'DAZN', 'Bundesliga'],
    'J League': ['Jリーグ公式', 'DAZN Japan', 'DAZN'],
  },
  en: {
    'Premier League': ['Premier League', 'Sky Sports', 'NBC Sports', 'ESPN'],
    'La Liga': ['LaLiga', 'ESPN'],
    Bundesliga: ['Bundesliga', 'Sky Sports', 'ESPN'],
    'J League': ['J League'],
  },
};

function getPriority(language: AppLanguage, league: string, sourceName: string): number {
  const list = sourcePriorityByLanguage[language]?.[league] ?? [];
  const idx = list.findIndex((name) => name.toLowerCase() === sourceName.toLowerCase());
  return idx === -1 ? 999 : idx;
}

function getRecommendedLabel(language: AppLanguage): string {
  return language === 'ja' ? 'おすすめ' : 'Recommended';
}

function shouldShowRecheck(statusMessage: string | null): boolean {
  if (!statusMessage) return false;
  const lower = statusMessage.toLowerCase();
  return (
    statusMessage.includes('まだ公開') ||
    lower.includes('not uploaded') ||
    lower.includes('no official highlights')
  );
}

function isDirectVideo(source: HighlightSourceOption): boolean {
  return Boolean(source.videoUrl);
}

function getSourceCta(source: HighlightSourceOption, language: AppLanguage): string {
  if (isDirectVideo(source)) {
    return language === 'ja' ? 'ここで再生' : 'Play here';
  }
  return language === 'ja' ? '公式チャンネルへ' : 'Visit official channel';
}

function toEmbedUrl(videoUrl?: string | null): string | null {
  if (!videoUrl) return null;

  try {
    const url = new URL(videoUrl);
    const videoId = url.searchParams.get('v');
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  } catch {
    return null;
  }
}

export function MatchDetailPage({ blindMode, onWatch, language }: MatchDetailPageProps) {
  const { id } = useParams();

  const [revealed, setRevealed] = useState(false);
  const [match, setMatch] = useState<Match | null>(null);
  const [sources, setSources] = useState<HighlightSourceOption[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rechecking, setRechecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [selectedSourceName, setSelectedSourceName] = useState<string | null>(null);

  const loadSources = useCallback(
    async (targetMatch: Match, isRecheck = false) => {
      if (isRecheck) setRechecking(true);

      const result = await fetchHighlightSources({
        league: targetMatch.league,
        homeTeam: targetMatch.homeTeam,
        awayTeam: targetMatch.awayTeam,
        language,
        status: targetMatch.status,
        datetime: targetMatch.datetime,
      }).catch(() => ({
        sources: [],
        statusMessage: 'まだ公式ハイライトが見つかりません',
      }));

      setSources(result.sources ?? []);
      setStatusMessage(result.statusMessage ?? null);

      if (isRecheck) setRechecking(false);
    },
    [language],
  );

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('試合IDが不正です。');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchMatchById(id)
      .then(async (m) => {
        if (cancelled) return;
        setMatch(m);
        await loadSources(m);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '試合詳細の取得に失敗しました。');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, loadSources]);

  const sortedSources = useMemo(() => {
    if (!match) return sources;
    return [...sources].sort((a, b) => {
      const aPriority = getPriority(language, match.league, a.sourceName);
      const bPriority = getPriority(language, match.league, b.sourceName);
      if (aPriority !== bPriority) return aPriority - bPriority;
      return 0;
    });
  }, [sources, language, match]);

  const featuredSource = sortedSources[0];
  const secondarySources = sortedSources.slice(1);
  const embedUrl = useMemo(() => toEmbedUrl(selectedVideoUrl), [selectedVideoUrl]);

  const handlePlaySource = useCallback(
    (source: HighlightSourceOption) => {
      if (!match || !source.videoUrl) return;

      setSelectedVideoUrl(source.videoUrl);
      setSelectedSourceName(source.sourceName);
      onWatch(match.homeTeam, match.awayTeam, match.league);
    },
    [match, onWatch],
  );

  if (loading) {
    return <main className="mx-auto max-w-5xl p-4 text-slate-300">試合情報を読み込み中…</main>;
  }

  if (error || !match) {
    return (
      <div className="mx-auto max-w-5xl p-4 text-slate-200">
        <p>{error ?? '一致するものが見つかりません。'}</p>
        <Link to="/" className="mt-3 inline-block text-brand-500">
          ホームに戻る
        </Link>
      </div>
    );
  }

  const showResult = !blindMode || revealed;
  const recommendLabel = getRecommendedLabel(language);

  return (
    <main className="mx-auto max-w-5xl space-y-4 px-4 py-5">
      <Link to="/" className="text-sm text-brand-500">
        ← 戻る
      </Link>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-card">
        <p className="text-xs text-slate-400">{match.league}</p>
        <h1 className="mt-1 text-xl font-bold text-white">
          {match.homeTeam} vs {match.awayTeam}
        </h1>
        <p className="text-sm text-slate-300">
          {formatDateTime(match.datetime)} ・ {match.status === 'finished' ? '終了' : '予定'}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {!showResult && (
            <button
              onClick={() => setRevealed(true)}
              className="rounded-lg border border-brand-500 px-3 py-2 text-sm text-brand-500"
            >
              結果を表示
            </button>
          )}

          {showResult && (
            <>
              <p className="text-lg font-semibold text-white">
                {match.score ? `${match.score.home} - ${match.score.away}` : 'スコア未確定'}
              </p>
              {blindMode && (
                <button
                  onClick={() => setRevealed(false)}
                  className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200"
                >
                  結果を隠す
                </button>
              )}
            </>
          )}
        </div>
      </section>

      {embedUrl && (
        <section className="overflow-hidden rounded-2xl border border-brand-500/40 bg-slate-950 shadow-card">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {language === 'ja' ? '再生中' : 'Now playing'}
              </p>
              <p className="text-sm font-semibold text-white">
                {selectedSourceName ?? (language === 'ja' ? '公式ハイライト' : 'Official highlight')}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedVideoUrl(null);
                setSelectedSourceName(null);
              }}
              className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200 transition hover:border-slate-500"
            >
              {language === 'ja' ? '閉じる' : 'Close'}
            </button>
          </div>

          <div className="aspect-video w-full bg-black">
            <iframe
              src={embedUrl}
              title="Highlight player"
              className="h-full w-full"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        </section>
      )}

      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          公式ハイライト視聴先
        </h2>

        {statusMessage && <p className="text-sm text-slate-400">{statusMessage}</p>}

        {shouldShowRecheck(statusMessage) && (
          <button
            onClick={() => loadSources(match, true)}
            disabled={rechecking}
            className="rounded-lg border border-brand-500 px-3 py-2 text-sm text-brand-500 disabled:opacity-50"
          >
            {rechecking
              ? language === 'ja'
                ? '再チェック中…'
                : 'Checking…'
              : language === 'ja'
                ? '再チェック'
                : 'Check again'}
          </button>
        )}

        {sortedSources.length === 0 ? (
          <p className="text-sm text-slate-400">
            {language === 'ja' ? '公式ハイライトはまだ見つかっていません。' : 'No official highlights available yet'}
          </p>
        ) : (
          <div className="space-y-3">
            {featuredSource &&
              (() => {
                const priority = getPriority(language, match.league, featuredSource.sourceName);
                const recommended = featuredSource.isRecommended || priority <= 1;
                const directVideo = isDirectVideo(featuredSource);
                const ctaLabel = getSourceCta(featuredSource, language);

                return (
                  <article className="overflow-hidden rounded-2xl border border-brand-500/60 bg-gradient-to-b from-brand-500/20 to-slate-950/60 shadow-card">
                    <div className="space-y-3 p-4">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-brand-500 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-950">
                          Top pick
                        </span>
                        {recommended && (
                          <span className="rounded-full bg-brand-500/20 px-2 py-1 text-[10px] font-semibold text-brand-300">
                            {recommendLabel}
                          </span>
                        )}
                      </div>

                      {directVideo ? (
                        <button
                          type="button"
                          onClick={() => handlePlaySource(featuredSource)}
                          className="block w-full rounded-xl border border-brand-500 bg-brand-500/20 px-4 py-3 text-left text-base font-semibold text-brand-200 transition hover:bg-brand-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                        >
                          <span className="inline-flex items-center gap-2">
                            {featuredSource.sourceName}
                            <span aria-hidden>▶</span>
                          </span>
                          <span className="mt-1 block text-xs font-normal text-slate-300">{ctaLabel}</span>
                        </button>
                      ) : (
                        <a
                          href={featuredSource.channelUrl ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-left text-base font-semibold text-slate-100 transition hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                        >
                          <span className="inline-flex items-center gap-2">
                            {featuredSource.sourceName}
                            <span aria-hidden>↗</span>
                          </span>
                          <span className="mt-1 block text-xs font-normal text-slate-300">{ctaLabel}</span>
                        </a>
                      )}
                    </div>
                  </article>
                );
              })()}

            {secondarySources.map((source) => {
              const priority = getPriority(language, match.league, source.sourceName);
              const recommended = source.isRecommended || priority <= 1;
              const directVideo = isDirectVideo(source);
              const ctaLabel = getSourceCta(source, language);

              return (
                <article
                  key={`${source.sourceName}-${source.videoUrl ?? source.channelUrl ?? 'fallback'}`}
                  className={`rounded-xl border p-3 transition ${
                    directVideo
                      ? 'border-brand-500/40 bg-brand-500/10'
                      : 'border-slate-700 bg-slate-950/30 opacity-90'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {directVideo ? (
                      <button
                        type="button"
                        onClick={() => handlePlaySource(source)}
                        className="flex-1 rounded-lg border border-brand-500 bg-brand-500/20 px-3 py-2 text-left text-sm font-semibold text-brand-300 transition hover:bg-brand-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        <span className="inline-flex items-center gap-1">
                          {source.sourceName}
                          <span aria-hidden>▶</span>
                        </span>
                        <span className="mt-0.5 block text-[11px] font-normal text-slate-300">{ctaLabel}</span>
                      </button>
                    ) : (
                      <a
                        href={source.channelUrl ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 rounded-lg border border-slate-600 bg-transparent px-3 py-2 text-left text-sm font-semibold text-slate-200 transition hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      >
                        <span className="inline-flex items-center gap-1">
                          {source.sourceName}
                          <span aria-hidden>↗</span>
                        </span>
                        <span className="mt-0.5 block text-[11px] font-normal text-slate-300">{ctaLabel}</span>
                      </a>
                    )}

                    {recommended && (
                      <span className="rounded-full bg-brand-500/20 px-2 py-1 text-[10px] font-semibold text-brand-400">
                        {recommendLabel}
                      </span>
                    )}

                    {source.channelUrl && directVideo && (
                      <a
                        href={source.channelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-200 transition hover:border-slate-400"
                      >
                        公式
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}