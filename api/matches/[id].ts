import type { VercelRequest, VercelResponse } from '@vercel/node';

const leagueMap: Record<string, string> = {
  PL: 'Premier League',
  PD: 'La Liga',
  BL1: 'Bundesliga',
  SA: 'Serie A',
  FL1: 'Ligue 1',
};

async function footballRequest(pathname: string) {
  const API_KEY = process.env.FOOTBALL_DATA_API_KEY;

  if (!API_KEY) {
    throw new Error('FOOTBALL_DATA_API_KEY is missing');
  }

  const url = `https://api.football-data.org/v4/${pathname}`;

  const res = await fetch(url, {
    headers: {
      'X-Auth-Token': API_KEY,
    },
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`football-data failed: ${res.status} ${text}`);
  }

  return JSON.parse(text);
}

function mapMatch(item: any) {
  const code = item.competition?.code;

  return {
    id: String(item.id),
    homeTeam: item.homeTeam?.name ?? '',
    awayTeam: item.awayTeam?.name ?? '',
    league: leagueMap[code] ?? code,
    datetime: item.utcDate,
    status: item.status === 'FINISHED' ? 'finished' : 'upcoming',
    matchday: item.matchday ?? null,
    score:
      item.status === 'FINISHED'
        ? {
            home: item.score?.fullTime?.home ?? 0,
            away: item.score?.fullTime?.away ?? 0,
          }
        : undefined,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const id = String(req.query.id);

    const data = await footballRequest(`matches/${id}`);

    const mapped = mapMatch(data);

    return res.status(200).json(mapped);
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to fetch match',
      detail: String(err),
    });
  }
}