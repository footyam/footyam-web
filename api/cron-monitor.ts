import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runHighlightMonitorOnce } from '../src/lib/highlight-engine.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const result = await runHighlightMonitorOnce();
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({
      error: 'cron failed',
      detail: String(e),
    });
  }
}