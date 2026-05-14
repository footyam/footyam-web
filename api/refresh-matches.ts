import type { VercelRequest, VercelResponse } from '@vercel/node';
import { saveMatchesCache } from '../src/lib/blob.js';

const TOP_LEAGUES = ['PL', 'PD', 'BL1', 'SA', 'FL1'];

const leagueMap: Record<string, string> = {
  PL: 'Premier League',
  PD: 'La Liga',
  BL1: 'Bundesliga',
  SA: 'Serie A',
  FL1: 'Ligue 1',
};

const allowedCodes = new Set(TOP_LEAGUES);

async function footballRequest(pathname: string, searchParams: Record<string, string>) {
  const API_KEY = process.env.FOOTBALL_DATA_API_KEY;

  if (!API_KEY) {
    throw new Error('FOOTBALL_DATA_API_KEY is missing');
  }

  const url = new URL(`https://api.football-data.org/v4/${pathname}`);

  for (const [k, v] of Object.entries(searchParams)) {
    if (v) url.searchParams.set(k, v);
  }

  const apiRes = await fetch(url, {
    headers: {
      'X-Auth-Token': API_KEY,
    },
  });

  const text = await apiRes.text();

  if (!apiRes.ok) {
    throw new Error(`football-data failed: ${apiRes.status} ${text}`);
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
    const dateFrom = new Date();
    const dateTo = new Date();

    dateFrom.setUTCDate(dateFrom.getUTCDate() - 7);
    dateTo.setUTCDate(dateTo.getUTCDate() + 1);

    let all: any[] = [];

    for (const code of TOP_LEAGUES) {
      const data = await footballRequest(`competitions/${code}/matches`, {
        dateFrom: dateFrom.toISOString().slice(0, 10),
        dateTo: dateTo.toISOString().slice(0, 10),
      });

      all = all.concat(data.matches ?? []);
    }

    const mapped = all
      .filter((m) => allowedCodes.has(m.competition?.code))
      .map(mapMatch)
      .sort((a, b) => Date.parse(b.datetime) - Date.parse(a.datetime));

    await saveMatchesCache(mapped);

    return res.status(200).json({
      ok: true,
      count: mapped.length,
      updatedAt: Date.now(),
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to refresh matches',
      detail: String(err),
    });
  }
}