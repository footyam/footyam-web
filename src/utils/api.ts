import type { HighlightSourcesResponse, Match } from '../types';

const API_BASE_URL = '';

export async function fetchRecentMatches(): Promise<Match[]> {
  const response = await fetch(`${API_BASE_URL}/api/matches/recent`);

  if (!response.ok) {
    throw new Error('Failed to load matches');
  }

  return (await response.json()) as Match[];
}

export async function fetchMatchById(id: string): Promise<Match> {
  const response = await fetch(`${API_BASE_URL}/api/matches/${id}`);

  if (!response.ok) {
    throw new Error('Failed to load match details');
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
  const response = await fetch(
    `${API_BASE_URL}/api/highlights/by-match/${params.matchId}`,
  );

  if (!response.ok) {
    throw new Error('Failed to load highlight sources');
  }

  return (await response.json()) as HighlightSourcesResponse;
}

export async function refreshHighlightSources(
  matchId: string,
  language: 'ja' | 'en',
): Promise<HighlightSourcesResponse> {
  const query = new URLSearchParams({ language });
  const response = await fetch(
    `${API_BASE_URL}/api/highlights/refresh/${matchId}?${query.toString()}`,
  );

  if (!response.ok) {
    throw new Error('Failed to refresh highlights');
  }

  return (await response.json()) as HighlightSourcesResponse;
}