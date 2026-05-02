import type { VercelRequest, VercelResponse } from '@vercel/node';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY!;

function buildQuery(match: any) {
  return `${match.homeTeam} ${match.awayTeam} highlights`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const id = String(req.query.id);

    // ① match取得
    const baseUrl = `https://${req.headers.host}`;
    const matchRes = await fetch(`${baseUrl}/api/matches/${id}`);
    const match = await matchRes.json();

    // ② 試合終了してなければスキップ
    if (match.status !== 'finished') {
      return res.status(200).json({
        sources: [],
        statusMessage: 'Match not finished',
      });
    }

    // ③ YouTube検索
    const query = buildQuery(match);

    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        query
      )}&type=video&maxResults=3&key=${YOUTUBE_API_KEY}`
    );

    const ytData = await ytRes.json();

    const videos =
      ytData.items?.map((item: any) => ({
        sourceId: item.id.videoId,
        sourceName: item.snippet.channelTitle,
        videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnail: item.snippet.thumbnails?.medium?.url,
      })) ?? [];

    return res.status(200).json({
      sources: videos,
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to fetch highlights',
      detail: String(err),
    });
  }
}