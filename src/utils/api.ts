import type { HighlightSourcesResponse, Match } from '../types';

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
  matchId: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  language: 'ja' | 'en';
  status: 'finished' | 'upcoming';
  datetime: string;
}): Promise<HighlightSourcesResponse> {
  const response = await fetch(`/api/highlights/by-match/${params.matchId}`);

  if (!response.ok) {
    throw new Error('ハイライト視聴先の取得に失敗しました');
  }

  return (await response.json()) as HighlightSourcesResponse;
}

export async function refreshHighlightSources(
  matchId: string,
  language: 'ja' | 'en',
): Promise<HighlightSourcesResponse> {
  const query = new URLSearchParams({ language });
  const response = await fetch(`/api/highlights/refresh/${matchId}?${query.toString()}`);
  if (!response.ok) {
    throw new Error('ハイライトの再検索に失敗しました');
  }
  return (await response.json()) as HighlightSourcesResponse;
}