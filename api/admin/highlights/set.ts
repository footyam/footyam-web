import type { VercelRequest, VercelResponse } from '@vercel/node';
import { saveHighlightState } from '../../../src/lib/blob.js';

const CHANNELS = {
  u_next_football: {
    id: 'u_next_football',
    label: 'U-NEXTフットボール',
    channelUrl: 'https://www.youtube.com/@UNEXT_football',
    priority: 2,
  },
  dazn_japan: {
    id: 'dazn_japan',
    label: 'DAZN Japan',
    channelUrl: 'https://www.youtube.com/@DAZNJapan',
    priority: 1,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'method not allowed' });
    }

    const { matchId, videoUrl, sourceId } = req.body ?? {};

    if (!matchId || !videoUrl || !sourceId) {
      return res.status(400).json({
        error: 'matchId, videoUrl, and sourceId are required',
      });
    }

    const channel = CHANNELS[sourceId as keyof typeof CHANNELS];

    if (!channel) {
      return res.status(400).json({
        error: 'invalid sourceId',
        allowed: Object.keys(CHANNELS),
      });
    }

    await saveHighlightState({
      [String(matchId)]: {
        found: true,
        foundAt: Date.now(),
        updatedAt: Date.now(),
        videos: [
          {
            sourceId: channel.id,
            sourceName: channel.label,
            channelUrl: channel.channelUrl,
            videoUrl: String(videoUrl),
            isRecommended: channel.priority === 1,
          },
        ],
      },
    });

    return res.status(200).json({
      ok: true,
      matchId: String(matchId),
      sourceId: channel.id,
      videoUrl: String(videoUrl),
    });
  } catch (err) {
    return res.status(500).json({
      error: 'failed to save highlight',
      detail: String(err),
    });
  }
}