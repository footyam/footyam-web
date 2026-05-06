import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ShareMatchButton } from '../components/ShareMatchButton';
import { VideoEmbed } from '../components/VideoEmbed';
import { ENABLE_ACCOUNT_FEATURES } from '../config/features';
import type { HighlightSourceOption, Match } from '../types';
import { fetchHighlightSources, fetchMatchById } from '../utils/api';
import { formatDateTime } from '../utils/date';
import { trackEvent } from '../utils/analytics';

interface NotificationSettings {
  enabled: boolean;
}

interface MatchDetailPageProps {
  blindMode: boolean;
  onWatch: (homeTeam: string, awayTeam: string, league: string) => void;
  favorites: string[];
  notificationSettings: NotificationSettings;
  manualNotifyMatchIds: string[];
  manualMutedMatchIds: string[];
  onTurnOnMatchNotification: (matchId: string) => void;
  onTurnOffMatchNotification: (matchId: string) => void;
  user: User | null;
}

const sourcePriorityByLeague: Record<string, string[]> = {
  'Premier League': ['U-NEXTフットボール', 'U-NEXT', 'DAZN Japan', 'DAZN', 'Premier League'],
  'La Liga': ['DAZN Japan', 'DAZN', 'U-NEXTフットボール', 'U-NEXT', 'LaLiga'],
  Bundesliga: ['DAZN Japan', 'DAZN', 'Bundesliga'],
  'Serie A': ['DAZN Japan', 'DAZN'],
  'Ligue 1': ['DAZN Japan', 'DAZN'],
  'J League': ['Jリーグ公式', 'DAZN Japan', 'DAZN'],
};

function getPriority(league: string, sourceName: string): number {
  const list = sourcePriorityByLeague[league] ?? [];
  const idx = list.findIndex((name) => name.toLowerCase() === sourceName.toLowerCase());
  return idx === -1 ? 999 : idx;
}

function formatMatchStatus(status: string): string {
  if (status === 'finished') return 'Finished';
  if (status === 'upcoming') return 'Upcoming';
  if (status === 'live') return 'Live';
  return status;
}

function isDirectVideo(source: HighlightSourceOption): boolean {
  return Boolean(source.videoUrl);
}

function getSourceDestination(source: HighlightSourceOption): string {
  return source.videoUrl ?? source.channelUrl ?? '#';
}

function getSourceCta(source: HighlightSourceOption): string {
  if (isDirectVideo(source)) return 'Watch Highlights';
  if (source.channelUrl) return 'Official Channel';
  return 'Not Available Yet';
}

function getYouTubeVideoId(videoUrl: string): string | null {
  try {
    const url = new URL(videoUrl);

    if (url.hostname === 'youtu.be') {
      return url.pathname.split('/').filter(Boolean)[0] ?? null;
    }

    const directId = url.searchParams.get('v');
    if (directId) return directId;

    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts[0] === 'embed' && pathParts[1]) return pathParts[1];
    if (pathParts[0] === 'shorts' && pathParts[1]) return pathParts[1];

    return null;
  } catch {
    return null;
  }
}

export function MatchDetailPage({
  blindMode,
  onWatch,
  favorites,
  notificationSettings,
  manualNotifyMatchIds,
  manualMutedMatchIds,
  onTurnOnMatchNotification,
  onTurnOffMatchNotification,
  user,
}: MatchDetailPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [revealed, setRevealed] = useState(false);
  const [match, setMatch] = useState<Match | null>(null);
  const [sources, setSources] = useState<HighlightSourceOption[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<{
    url: string;
    id: string;
    sourceKey: string;
  } | null>(null);

  const loadSources = useCallback(async (targetMatch: Match) => {
    const result = await fetchHighlightSources({
      matchId: targetMatch.id,
      league: targetMatch.league,
      homeTeam: targetMatch.homeTeam,
      awayTeam: targetMatch.awayTeam,
      language: 'ja',
      status: targetMatch.status,
      datetime: targetMatch.datetime,
    }).catch(() => ({
      sources: [],
      statusMessage: 'No official highlights available yet.',
    }));

    setSources(result.sources ?? []);
    setStatusMessage(result.statusMessage ?? null);
  }, []);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Invalid match ID.');
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);
    setSelectedVideo(null);

    fetchMatchById(id)
      .then(async (m) => {
        if (cancelled) return;
        setMatch(m);
        await loadSources(m);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load match details.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, loadSources]);

  const sortedSources = useMemo(() => {
    if (!match) return sources;

    return [...sources].sort((a, b) => {
      const aPriority = getPriority(match.league, a.sourceName);
      const bPriority = getPriority(match.league, b.sourceName);
      return aPriority - bPriority;
    });
  }, [sources, match]);

  if (loading) {
    return <main className="mx-auto max-w-5xl p-4 text-slate-300">Loading match details...</main>;
  }

  if (error || !match) {
    return (
      <div className="mx-auto max-w-5xl p-4 text-slate-200">
        <p>{error ?? 'Match not found.'}</p>
        <Link to="/" className="mt-3 inline-block text-brand-500">
          Back to Home
        </Link>
      </div>
    );
  }

  const showResult = !blindMode || revealed;
  const noHighlightsLabel = 'No official highlights available yet.';
  const closePlayerLabel = 'Close';
  const openOnYouTubeLabel = 'Open on YouTube';

  const isFavoriteMatch =
    favorites.includes(match.homeTeam) || favorites.includes(match.awayTeam);

  const isNotifyOn =
    manualNotifyMatchIds.includes(match.id) ||
    (
      isFavoriteMatch &&
      notificationSettings.enabled &&
      !manualMutedMatchIds.includes(match.id)
    );

  const hasDirectHighlight = sortedSources.some((source) => source.videoUrl);
  const shouldShowNotifySwitch =
    ENABLE_ACCOUNT_FEATURES && (match.status === 'upcoming' || !hasDirectHighlight);

  const toggleMatchNotification = () => {
    if (!user) {
      navigate('/signin');
      return;
    }

    if (isNotifyOn) {
      onTurnOffMatchNotification(match.id);
    } else {
      onTurnOnMatchNotification(match.id);
    }
  };

  const openEmbeddedVideo = (source: HighlightSourceOption) => {
    if (!source.videoUrl) return;

    const videoId = getYouTubeVideoId(source.videoUrl);

    if (!videoId) {
      window.open(source.videoUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    setSelectedVideo({
      url: source.videoUrl,
      id: videoId,
      sourceKey: source.sourceName,
    });

    onWatch(match.homeTeam, match.awayTeam, match.league);
  };

  return (
    <main className="mx-auto max-w-5xl space-y-4 px-4 py-5">
      <Link to="/" className="text-sm text-brand-500">
        ← Back
      </Link>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-card">
        <div className="flex flex-col gap-2">
          <div>
            <p className="text-xs text-slate-400">{match.league}</p>
            <h1 className="mt-1 text-xl font-bold text-white">
              {match.homeTeam} vs {match.awayTeam}
            </h1>
            <p className="text-sm text-slate-300">
              {formatDateTime(match.datetime)} ・ {formatMatchStatus(match.status)}
            </p>
          </div>

          <div className="mt-1 flex flex-wrap items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {!showResult && (
                <button
                  onClick={() => setRevealed(true)}
                  className="rounded-lg border border-brand-500 px-3 py-2 text-sm text-brand-500"
                >
                  Show Result
                </button>
              )}

              {showResult && (
                <>
                  <p className="text-lg font-semibold text-white">
                    {match.score ? `${match.score.home} - ${match.score.away}` : 'Score TBD'}
                  </p>

                  {blindMode && (
                    <button
                      onClick={() => setRevealed(false)}
                      className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200"
                    >
                      Hide Result
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-3 self-start">
              {shouldShowNotifySwitch && (
                <button
                  type="button"
                  onClick={toggleMatchNotification}
                  aria-label={isNotifyOn ? 'Turn off match notification' : 'Turn on match notification'}
                  className={`relative h-8 w-14 rounded-full transition ${
                    isNotifyOn
                      ? 'bg-brand-500'
                      : 'border border-brand-500 bg-slate-900'
                  }`}
                >
                  <span
                    className={`absolute top-1 flex h-6 w-6 items-center justify-center rounded-full transition ${
                      isNotifyOn
                        ? 'right-1 bg-white'
                        : 'left-1 bg-brand-500'
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={isNotifyOn ? '#10b981' : 'white'}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
                      <path d="M13.73 21a2 2 0 01-3.46 0" />
                    </svg>
                  </span>
                </button>
              )}

              <ShareMatchButton
                matchId={Number(match.id)}
                homeTeam={match.homeTeam}
                awayTeam={match.awayTeam}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          Official Highlights
        </h2>

        {sortedSources.length === 0 ? (
          <p className="text-sm text-slate-400">{statusMessage ?? noHighlightsLabel}</p>
        ) : (
          <div className="space-y-3">
            {match.status === 'finished' && !hasDirectHighlight && (
  <p className="text-sm text-slate-400">
    Highlights not available yet
  </p>
)}
            {statusMessage && (
              <p className="text-sm text-slate-400">{statusMessage}</p>
            )}

            {sortedSources.map((source) => {
              const directVideo = isDirectVideo(source);
              const destination = getSourceDestination(source);
              const ctaLabel = getSourceCta(source);
              const isOpen = selectedVideo?.sourceKey === source.sourceName;

              return (
                <article
                  key={source.sourceName}
                  className="rounded-2xl border border-slate-700 bg-slate-950/30 p-3"
                >
                  {directVideo ? (
                    isOpen && selectedVideo ? (
                      <div className="space-y-3">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setSelectedVideo(null)}
                            className="rounded-xl border border-slate-500 bg-slate-900 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:border-brand-500 hover:text-brand-500"
                          >
                            {closePlayerLabel}
                          </button>
                        </div>

                        <VideoEmbed videoId={selectedVideo.id} />

                        <a
                          href={selectedVideo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200"
                        >
                          {openOnYouTubeLabel}
                        </a>
                      </div>
                    ) : (
            <button
  type="button"
  onClick={() => {
    trackEvent('highlight_click', {
      match_id: match?.id,
      home_team: match?.homeTeam,
      away_team: match?.awayTeam,
      league: match?.league,
      source: source.sourceName,
    });

    openEmbeddedVideo(source);
  }}
  className="block w-full rounded-xl border border-brand-500 bg-brand-500/20 px-4 py-3 text-left text-base font-semibold text-brand-200"
>                      

                        <span className="inline-flex items-center gap-2">
                          <span>▶</span>
                          <span>Watch Highlights</span>
                        </span>

                        <span className="mt-1 block text-xs font-normal text-slate-300">
                          {source.sourceName}
                        </span>
                      </button>
                    )
                  ) : (
                    <a
                      href={destination}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-left text-sm font-semibold text-slate-200"
                    >
                      <span className="inline-flex items-center gap-2">
                        {source.sourceName}
                        <span>↗</span>
                      </span>

                      <span className="mt-1 block text-xs font-normal text-slate-300">
                        {ctaLabel}
                      </span>
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}