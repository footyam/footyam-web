import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runHighlightMonitorOnce } from '../src/lib/highlight-engine.js';

const ALLOWED_LEAGUES = ['PL', 'PD', 'BL1', 'SA', 'FL1'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const league = typeof req.query.league === 'string' ? req.query.league : undefined;

    if (league && !ALLOWED_LEAGUES.includes(league)) {
      return res.status(400).json({
        error: 'invalid league',
        allowed: ALLOWED_LEAGUES,
      });
    }

    const result = await runHighlightMonitorOnce(league);

    return res.status(200).json({
      ...result,
      league: league ?? 'ALL',
    });
  } catch (e) {
    return res.status(500).json({
      error: 'cron failed',
      detail: String(e),
    });
  }
}