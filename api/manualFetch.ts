import { put } from '@vercel/blob';

export default async function handler(req, res) {
  try {
    const matchId = req.query.matchId;

    if (!matchId) {
      return res.status(400).json({ error: 'matchId required' });
    }

    // ① YouTube検索（仮）
    const video = {
      videoUrl: "https://www.youtube.com/watch?v=dummy",
      title: "test highlight"
    };

    // ② Blobに保存
    const key = `highlights/${matchId}.json`;

    await put(key, JSON.stringify(video), {
      access: 'public',
    });

    return res.json({ ok: true, saved: key });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}