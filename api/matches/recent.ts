import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const API_KEY = process.env.FOOTBALL_DATA_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'FOOTBALL_DATA_API_KEY is missing' });
  }

  try {
    const apiRes = await fetch('https://api.football-data.org/v4/matches', {
      headers: {
        'X-Auth-Token': API_KEY,
      },
    });

    const text = await apiRes.text();

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({
        error: 'football-data request failed',
        detail: text,
      });
    }

    return res.status(200).json(JSON.parse(text));
  } catch (err) {
    return res.status(500).json({
      error: 'fetch failed',
      detail: String(err),
    });
  }
}