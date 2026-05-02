import type { VercelRequest, VercelResponse } from '@vercel/node';
import { list } from '@vercel/blob';

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

const LEAGUE_PLAYLISTS: Record<string, { channelId: keyof typeof CHANNELS; playlistId: string }[]> = {
  'Premier League': [{ channelId: 'u_next_football', playlistId: 'PLoYMtUTlz8sYICoPp_j0CmyVtmv5038ai' }],
  'La Liga': [
    { channelId: 'dazn_japan', playlistId: 'PLEfXwIkfHxL-rwzMp33ac-l-qtPM4Svp0' },
    { channelId: 'u_next_football', playlistId: 'PLoYMtUTlz8sZFukDCqz7G8bXMj8kZtm9a' },
  ],
  Bundesliga: [{ channelId: 'dazn_japan', playlistId: 'PLEfXwIkfHxL--GrJ0Pwg5-czsw20z2kWp' }],
  'Serie A': [{ channelId: 'dazn_japan', playlistId: 'PLEfXwIkfHxL-cLEFurIQbnsBCHWdVm_RF' }],
  'Ligue 1': [{ channelId: 'dazn_japan', playlistId: 'PLEfXwIkfHxL91ssTCB7mhXBXAqDX6ksbz' }],
};

function getAllowedSourcesForLeague(league: string) {
  const rows = LEAGUE_PLAYLISTS[league] ?? [];

  return rows.map((row) => {
    const c = CHANNELS[row.channelId];

    return {
      sourceId: c.id,
      sourceName: c.label,
      channelUrl: c.channelUrl,
      isRecommended: c.priority === 1,
    };
  });
}

async function loadHighlightByMatchId(id: string) {
  const key = `highlights/${id}.json`;
  const blobs = await list({ prefix: key });

  const blob = blobs.blobs.find((b) => b.pathname === key) ?? blobs.blobs[0];

  if (!blob) return null;

  const res = await fetch(blob.url);
  return res.json();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const id = String(req.query.id);

    const saved = await loadHighlightByMatchId(id);

    if (saved?.videoUrl) {
      return res.status(200).json({
        sources: [
          {
            sourceId: 'manual',
            sourceName: saved.title ?? 'Highlight',
            videoUrl: saved.videoUrl,
            isRecommended: true,
          },
        ],
      });
    }

    const baseUrl = `https://${req.headers.host}`;
    const matchRes = await fetch(`${baseUrl}/api/matches/${id}`);
    const match = await matchRes.json();

    return res.status(200).json({
      sources: getAllowedSourcesForLeague(match.league),
      statusMessage: null,
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to load highlights',
      detail: String(err),
    });
  }
}