import { put } from '@vercel/blob';

export default async function handler(req, res) {
  try {
    const matchId = req.query.matchId;

    if (!matchId) {
      return res.status(400).json({ error: 'matchId required' });
    }

    const video = {
      videoUrl: 'https://www.youtube.com/watch?v=dummy',
      title: 'test highlight',
    };

    const key = `highlights/${matchId}.json`;

    await put(key, JSON.stringify(video), {
      access: 'public',
      addRandomSuffix: false,
    });

    return res.status(200).json({ ok: true, saved: key });
  } catch (e) {
    return res.status(500).json({ error: String(e?.message ?? e) });
  }
}