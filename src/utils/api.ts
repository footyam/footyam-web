import type { HighlightSourcesResponse, Match, YouTubeCandidate } from '../types';

export async function fetchRecentMatches(): Promise<Match[]> {
  const response = await fetch('/api/matches/recent');
  if (!response.ok) {
    throw new Error('試合一覧の取得に失敗しました');
  }
  return (await response.json()) as Match[];
}

export async function fetchMatchById(id: string): Promise<Match> {
  const response = await fetch(`/api/matches/${id}`);
  if (!response.ok) {
    throw new Error('試合詳細の取得に失敗しました');
  }
  return (await response.json()) as Match;
}

export async function fetchHighlightSources(params: {
  league: string;
  homeTeam: string;
  awayTeam: string;
  language: 'ja' | 'en';
  status: 'finished' | 'upcoming';
  datetime: string;
}): Promise<HighlightSourcesResponse> {
  const query = new URLSearchParams(params);
  const response = await fetch(`/api/highlights/search?${query.toString()}`);
  if (!response.ok) {
    throw new Error('ハイライト視聴先の取得に失敗しました');
  }
  return (await response.json()) as HighlightSourcesResponse;
}

export async function fetchYouTubeHighlights(params: {
  league: string;
  homeTeam: string;
  awayTeam: string;
  language: 'ja' | 'en';
  status: 'finished' | 'upcoming';
}): Promise<YouTubeCandidate[]> {
  const query = new URLSearchParams(params);
  const response = await fetch(`/api/highlights/search?${query.toString()}`);
  if (!response.ok) {
    throw new Error('ハイライト候補の取得に失敗しました');
  }
  return (await response.json()) as YouTubeCandidate[];
}
