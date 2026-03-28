export type League = 'Premier League' | 'J League' | 'La Liga' | 'Bundesliga' | string;

export type MatchStatus = 'finished' | 'upcoming';

export type HighlightSourceType = 'youtube' | 'external';

export interface HighlightSource {
  sourceName: string;
  sourceType: HighlightSourceType;
  url: string;
  embedUrl?: string;
  isOfficial: boolean;
}

export interface Score {
  home: number;
  away: number;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: League;
  datetime: string;
  status: MatchStatus;
  score?: Score;
  highlightSources: HighlightSource[];
}

export interface HighlightSourceOption {
  sourceId: string;
  sourceName: string;
  videoUrl?: string;
  sourceName: string;
  searchUrl: string;
  channelUrl?: string;
  isRecommended: boolean;
  statusMessage?: string;
}

export interface HighlightSourcesResponse {
  sources: HighlightSourceOption[];
  statusMessage?: string;
export interface YouTubeCandidate {
  id: string;
  title: string;
  channelTitle: string;
  videoUrl: string;
  embedUrl: string;
  thumbnailUrl?: string;
  publishedAt?: string;
}
