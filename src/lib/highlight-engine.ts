import { loadHighlightState, saveHighlightState } from './blob.js';

const TOP_LEAGUES = ['PL', 'PD', 'BL1', 'SA', 'FL1'];

const leagueMap: Record<string, string> = {
  PL: 'Premier League',
  PD: 'La Liga',
  BL1: 'Bundesliga',
  SA: 'Serie A',
  FL1: 'Ligue 1',
};

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

const LEAGUE_PLAYLISTS: Record<
  string,
  { channelId: keyof typeof CHANNELS; playlistId: string }[]
> = {
  'Premier League': [
    {
      channelId: 'u_next_football',
      playlistId: 'PLoYMtUTlz8sYICoPp_j0CmyVtmv5038ai',
    },
  ],
  'La Liga': [
    {
      channelId: 'dazn_japan',
      playlistId: 'PLEfXwIkfHxL-rwzMp33ac-l-qtPM4Svp0',
    },
    {
      channelId: 'u_next_football',
      playlistId: 'PLoYMtUTlz8sZFukDCqz7G8bXMj8kZtm9a',
    },
  ],
  Bundesliga: [
    {
      channelId: 'dazn_japan',
      playlistId: 'PLEfXwIkfHxL--GrJ0Pwg5-czsw20z2kWp',
    },
  ],
  'Serie A': [
    {
      channelId: 'dazn_japan',
      playlistId: 'PLEfXwIkfHxL-cLEFurIQbnsBCHWdVm_RF',
    },
  ],
  'Ligue 1': [
    {
      channelId: 'dazn_japan',
      playlistId: 'PLEfXwIkfHxL91ssTCB7mhXBXAqDX6ksbz',
    },
  ],
};

const TEAM_ALIASES: Record<string, string[]> = {
  'Manchester United FC': ['Manchester United', 'Man United', 'Man Utd', 'マンチェスター・ユナイテッド', 'マンU'],
  'Manchester City FC': ['Manchester City', 'Man City', 'マンチェスター・シティ', 'マンC'],
  'Brentford FC': ['Brentford', 'ブレントフォード'],
  'Everton FC': ['Everton', 'エヴァートン'],
  'Liverpool FC': ['Liverpool', 'リヴァプール', 'リバプール'],
  'Chelsea FC': ['Chelsea', 'チェルシー'],
  'Arsenal FC': ['Arsenal', 'アーセナル'],
  'FC Barcelona': ['Barcelona', 'Barça', 'Barca', 'バルセロナ', 'バルサ'],
  'Real Madrid CF': ['Real Madrid', 'レアル・マドリー', 'レアルマドリー'],
  'RCD Espanyol de Barcelona': ['Espanyol', 'エスパニョール'],
  'Levante UD': ['Levante', 'レバンテ'],
};

function normalize(text: string) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[×x]/g, ' ')
    .replace(/[【】\[\]()（）|｜:：,，.!?？・]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getAliases(team: string) {
  return TEAM_ALIASES[team] ?? [team.replace(/ FC$/, ''), team];
}

function titleHasTeam(title: string, team: string) {
  const t = normalize(title);
  return getAliases(team).some((a) => t.includes(normalize(a)));
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

async function footballRequest(pathname: string, searchParams: Record<string, string>) {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) throw new Error('FOOTBALL_DATA_API_KEY is missing');

  const url = new URL(`https://api.football-data.org/v4/${pathname}`);

  for (const [k, v] of Object.entries(searchParams)) {
    if (v) url.searchParams.set(k, v);
  }

  const res = await fetch(url, {
    headers: { 'X-Auth-Token': apiKey },
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`football-data failed: ${res.status} ${text}`);
  }

  return JSON.parse(text);
}

async function youtubeRequest(pathname: string, searchParams: Record<string, string>) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is missing');

  const url = new URL(`https://www.googleapis.com/youtube/v3/${pathname}`);

  for (const [k, v] of Object.entries(searchParams)) {
    if (v) url.searchParams.set(k, v);
  }

  url.searchParams.set('key', apiKey);

  const res = await fetch(url);
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`youtube failed: ${res.status} ${text}`);
  }

  return JSON.parse(text);
}

async function fetchRecentMatches() {
  const dateFrom = new Date();
  const dateTo = new Date();

  dateFrom.setUTCDate(dateFrom.getUTCDate() - 7);
  dateTo.setUTCDate(dateTo.getUTCDate() + 2);

  let all: any[] = [];

  for (const code of TOP_LEAGUES) {
    const data = await footballRequest(`competitions/${code}/matches`, {
      dateFrom: dateFrom.toISOString().slice(0, 10),
      dateTo: dateTo.toISOString().slice(0, 10),
    });

    all = all.concat(data.matches ?? []);
  }

  return all.map(mapMatch);
}

async function fetchPlaylistItems(playlistId: string) {
  const data = await youtubeRequest('playlistItems', {
    part: 'snippet,contentDetails',
    playlistId,
    maxResults: '25',
  });

  return data.items ?? [];
}

function scoreVideoAgainstMatch(title: string, match: any) {
  const homeMatched = titleHasTeam(title, match.homeTeam);
  const awayMatched = titleHasTeam(title, match.awayTeam);

  if (!homeMatched || !awayMatched) return 0;

  const t = normalize(title);

  let score = 50;

  if (t.includes(normalize('ショートハイライト'))) score += 55;
  if (t.includes(normalize('ハイライト'))) score += 40;
  if (t.includes(normalize('ダイジェスト'))) score += 30;
  if (t.includes('highlight')) score += 40;
  if (t.includes('highlights')) score += 40;

  if (t.includes(normalize('速報'))) score -= 25;
  if (t.includes(normalize('会見'))) score -= 20;
  if (t.includes(normalize('インタビュー'))) score -= 20;

  if (match.matchday) {
    if (
      t.includes(normalize(`第${match.matchday}節`)) ||
      t.includes(normalize(`matchday ${match.matchday}`))
    ) {
      score += 20;
    }
  }

  return score;
}

function buildVideoUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export async function runHighlightMonitorOnce() {
  const recent = await fetchRecentMatches();
  const finished = recent.filter((m) => m.status === 'finished');

  const state = await loadHighlightState();

  let matchedCount = 0;

  for (const [league, rows] of Object.entries(LEAGUE_PLAYLISTS)) {
    for (const row of rows) {
      const channel = CHANNELS[row.channelId];
      const items = await fetchPlaylistItems(row.playlistId);

      for (const item of items) {
        const title = item?.snippet?.title ?? '';
        const videoId = item?.contentDetails?.videoId;
        if (!videoId) continue;

        let best: any = null;
        let bestScore = 0;

        for (const match of finished) {
          if (match.league !== league) continue;

          const score = scoreVideoAgainstMatch(title, match);

          if (score > bestScore) {
            best = match;
            bestScore = score;
          }
        }

        if (!best || bestScore < 50) continue;

        const matchId = String(best.id);
        const existing = state[matchId];

        const existingVideos = Array.isArray(existing?.videos)
          ? existing.videos
          : existing?.video
            ? [existing.video]
            : [];

        const newVideo = {
          sourceId: channel.id,
          sourceName: channel.label,
          channelUrl: channel.channelUrl,
          videoUrl: buildVideoUrl(videoId),
          isRecommended: channel.priority === 1,
        };

        const videos = [
          ...existingVideos.filter((video: any) => video.sourceId !== newVideo.sourceId),
          newVideo,
        ].sort((a, b) => {
          if (Number(b.isRecommended) !== Number(a.isRecommended)) {
            return Number(b.isRecommended) - Number(a.isRecommended);
          }
          return a.sourceName.localeCompare(b.sourceName);
        });

        state[matchId] = {
          found: true,
          foundAt: existing?.foundAt ?? Date.now(),
          updatedAt: Date.now(),
          videos,
        };

        matchedCount += 1;
      }
    }
  }

  await saveHighlightState(state);

  return {
    ok: true,
    matchedCount,
    savedMatches: Object.keys(state).length,
  };
}