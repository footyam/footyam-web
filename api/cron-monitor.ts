import { runHighlightMonitorOnce } from '../src/lib/highlight-engine.js';

export default async function handler(req, res) {
  try {
    const result = await runHighlightMonitorOnce();
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({
      error: 'monitor failed',
      detail: String(err),
    });
  }
}