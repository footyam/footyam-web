import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { URL } from 'node:url';

// =========================
// .env loader
// =========================
loadEnvFile();

const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const PORT = Number(process.env.PORT ?? 8787);

const DEBUG = true;

// =========================
// Competition config
// =========================
const leagueMap = {
  PL: 'Premier League',
  PD: 'La Liga',
  BL1: 'Bundesliga',
};

const allowedCodes = new Set(['PL', 'PD', 'BL1']);

const CHANNELS = {
  u_next_football: {
    id: 'u_next_football',
    label: 'U-NEXTフットボール',
    channelQuery: 'U-NEXTフットボール',
    channelTitleAliases: ['u-nextフットボール', 'u-next football', 'u-next'],
    channelUrl: 'https://www.youtube.com/@UNEXT_football',
    priority: 1,
    official: true,
  },
  dazn_japan: {
    id: 'dazn_japan',
    label: 'DAZN Japan',
    channelQuery: 'DAZN Japan',
    channelTitleAliases: ['dazn japan', 'daznjp', 'dazn'],
    channelUrl: 'https://www.youtube.com/@DAZNJP',
    priority: 2,
    official: true,
  },
};

const COMPETITION_CHANNELS = {
  'Premier League': ['u_next_football'],
  'La Liga': ['dazn_japan', 'u_next_football'],
  Bundesliga: ['dazn_japan'],
};

const LEAGUE_KEYWORDS = {
  'Premier League': ['premier league', 'プレミアリーグ'],
  'La Liga': ['la liga', 'ラ・リーガ', 'ラリーガ', 'laliga ea sports'],
  Bundesliga: ['bundesliga', 'ブンデスリーガ', 'ブンデス'],
};

const PLAYLIST_QUERIES = {
  'Premier League': {
    u_next_football: [
      'プレミアリーグ ハイライト',
      'プレミアリーグショートハイライト',
      'Premier League highlights',
    ],
  },
  'La Liga': {
    dazn_japan: [
      'LaLiga EA Sports',
      '25/26ラ・リーガ',
      'ラ・リーガ ハイライト',
      'La Liga highlights',
    ],
    u_next_football: [
      'ラ・リーガ ハイライト',
      'LaLiga EA Sports',
      'ラリーガ ハイライト',
      'La Liga highlights',
    ],
  },
  Bundesliga: {
    dazn_japan: [
      'ブンデスリーガ ハイライト',
      'Bundesliga highlights',
    ],
  },
};

const HIGHLIGHT_KEYWORDS = [
  'highlight',
  'highlights',
  'ハイライト',
  'ダイジェスト',
  'resumen',
  'extended highlights',
];

const SHORTS_KEYWORDS = [
  '#shorts',
  'shorts',
  'ショート',
  'short highlight',
  'short highlights',
];

// =========================
// Team aliases
// =========================
const TEAM_ALIASES = {
  // Premier League
  'Arsenal FC': ['Arsenal', 'アーセナル'],
  'Aston Villa FC': ['Aston Villa', 'アストン・ヴィラ', 'アストンヴィラ'],
  'AFC Bournemouth': ['Bournemouth', 'AFC Bournemouth', 'ボーンマス'],
  'Brentford FC': ['Brentford', 'ブレントフォード'],
  'Brighton & Hove Albion FC': ['Brighton', 'Brighton & Hove Albion', 'ブライトン'],
  'Burnley FC': ['Burnley', 'バーンリー'],
  'Chelsea FC': ['Chelsea', 'チェルシー'],
  'Crystal Palace FC': ['Crystal Palace', 'Palace', 'クリスタル・パレス', 'クリスタルパレス'],
  'Everton FC': ['Everton', 'エヴァートン', 'エバートン'],
  'Fulham FC': ['Fulham', 'フラム'],
  'Leeds United FC': ['Leeds', 'Leeds United', 'リーズ'],
  'Liverpool FC': ['Liverpool', 'リヴァプール', 'リバプール'],
  'Manchester City FC': ['Manchester City', 'Man City', 'マンチェスター・シティ', 'マンチェスターシティ',
'マンチェスター・C', 'マンC',],
  'Manchester United FC': [
  'Manchester United',
  'Man United',
  'Man Utd',
  'Manchester Utd',
  'マンチェスター・ユナイテッド',
  'マンチェスターユナイテッド',
  'マンチェスター・U',
  'マンU',
],
  'Newcastle United FC': ['Newcastle', 'Newcastle United', 'ニューカッスル'],
  'Nottingham Forest FC': ['Nottingham Forest', 'Forest', 'ノッティンガム・フォレスト', 'ノッティンガムフォレスト'],
  'Sunderland AFC': ['Sunderland', 'サンダーランド'],
  'Tottenham Hotspur FC': ['Tottenham', 'Tottenham Hotspur', 'Spurs', 'スパーズ', 'トッテナム・ホットスパー', 'トッテナム'],
  'West Ham United FC': ['West Ham', 'West Ham United', 'ウェストハム', 'ウエストハム'],
  'Wolverhampton Wanderers FC': ['Wolverhampton', 'Wolves', 'Wolverhampton Wanderers', 'ウルヴス', 'ウルブス', 'ウォルヴァーハンプトン'],

  // La Liga
  'Athletic Club': ['Athletic Club', 'Athletic Bilbao', 'アスレティック・クルブ', 'アスレティック・ビルバオ', 'ビルバオ'],
  'Club Atlético de Madrid': [
    'Atlético de Madrid',
    'Atletico Madrid',
    'Atlético',
    'アトレティコ・マドリー',
    'アトレティコ・デ・マドリー',
    'アトレティコ・マドリード',
    'アトレティコマドリード',
    'アトレティコ',
  ],
  'CA Osasuna': ['CA Osasuna', 'Osasuna', 'オサスナ'],
  'RC Celta de Vigo': ['Celta', 'Celta Vigo', 'RC Celta de Vigo', 'セルタ', 'セルタ・デ・ビーゴ', 'セルタ・ビーゴ'],
  'Deportivo Alavés': ['Deportivo Alavés', 'Alavés', 'Alaves', 'アラベス'],
  'Elche CF': ['Elche', 'Elche CF', 'エルチェ'],
  'FC Barcelona': ['FC Barcelona', 'Barcelona', 'Barça', 'Barca', 'バルセロナ', 'バルサ'],
  'Getafe CF': ['Getafe', 'Getafe CF', 'ヘタフェ'],
  'Girona FC': ['Girona', 'Girona FC', 'ジローナ'],
  'Levante UD': ['Levante', 'Levante UD', 'レバンテ'],
  'Rayo Vallecano de Madrid': ['Rayo Vallecano', 'Rayo', 'ラージョ・バジェカーノ', 'ラージョ'],
  'RCD Espanyol de Barcelona': ['Espanyol', 'RCD Espanyol', 'エスパニョール'],
  'RCD Mallorca': ['Mallorca', 'RCD Mallorca', 'マジョルカ'],
  'Real Betis Balompié': ['Real Betis', 'Betis', 'ベティス', 'レアル・ベティス'],
  'Real Madrid CF': [
    'Real Madrid',
    'レアル・マドリー',
    'レアルマドリー',
    'レアル・マドリード',
    'レアルマドリード',
  ],
  'Real Oviedo': ['Real Oviedo', 'Oviedo', 'オビエド', 'レアル・オビエド'],
  'Real Sociedad de Fútbol': ['Real Sociedad', 'Sociedad', 'レアル・ソシエダ', 'ソシエダ'],
  'Sevilla FC': ['Sevilla', 'Sevilla FC', 'セビージャ'],
  'Valencia CF': ['Valencia', 'Valencia CF', 'バレンシア'],
  'Villarreal CF': ['Villarreal', 'Villarreal CF', 'ビジャレアル'],

  // Bundesliga
  'FC Bayern München': ['FC Bayern München', 'Bayern Munich', 'Bayern', 'バイエルン', 'バイエルン・ミュンヘン'],
  'Bayer 04 Leverkusen': ['Bayer Leverkusen', 'Leverkusen', 'レヴァークーゼン', 'レバークーゼン'],
  'Eintracht Frankfurt': ['Eintracht Frankfurt', 'Frankfurt', 'フランクフルト'],
  'Borussia Dortmund': ['Borussia Dortmund', 'Dortmund', 'ドルトムント'],
  'SC Freiburg': ['SC Freiburg', 'Freiburg', 'フライブルク'],
  '1. FSV Mainz 05': ['Mainz', 'Mainz 05', '1. FSV Mainz 05', 'マインツ'],
  'RB Leipzig': ['RB Leipzig', 'Leipzig', 'ライプツィヒ'],
  'SV Werder Bremen': ['Werder Bremen', 'Bremen', 'ヴェルダー・ブレーメン', 'ブレーメン'],
  'VfB Stuttgart': ['VfB Stuttgart', 'Stuttgart', 'シュトゥットガルト'],
  'Borussia Mönchengladbach': ['Borussia Mönchengladbach', 'Mönchengladbach', 'Monchengladbach', 'Gladbach', 'ボルシアMG', 'メンヒェングラートバッハ', 'グラードバッハ'],
  'VfL Wolfsburg': ['VfL Wolfsburg', 'Wolfsburg', 'ヴォルフスブルク'],
  'FC Augsburg': ['FC Augsburg', 'Augsburg', 'アウクスブルク'],
  '1. FC Union Berlin': ['Union Berlin', '1. FC Union Berlin', 'ウニオン・ベルリン', 'ウニオンベルリン'],
  'FC St. Pauli 1910': ['St. Pauli', 'FC St. Pauli', 'ザンクト・パウリ', 'ザンクトパウリ', 'St Pauli'],
  'TSG 1899 Hoffenheim': ['Hoffenheim', 'TSG Hoffenheim', 'ホッフェンハイム'],
  '1. FC Heidenheim 1846': ['Heidenheim', '1. FC Heidenheim', 'ハイデンハイム'],
  '1. FC Köln': ['Köln', 'Koln', '1. FC Köln', '1. FC Koln', 'Cologne', 'ケルン'],
  'Hamburger SV': ['Hamburger SV', 'HSV', 'Hamburg', 'ハンブルガーSV', 'ハンブルク'],
};

// =========================
// Caches
// =========================
const channelCache = new Map();
const uploadsCache = new Map();
const playlistSearchCache = new Map();
const playlistItemsCache = new Map();

// =========================
// Helpers
// =========================
function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const idx = line.indexOf('=');
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

function debugLog(...args) {
  if (DEBUG) console.log(...args);
}

function stripDiacritics(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeText(text) {
  return stripDiacritics(String(text ?? ''))
    .toLowerCase()
    .replace(/[×xX]/g, ' ')
    .replace(/[【】\[\]（）()|｜:：,，.!?？・]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function simplifyTeamName(team) {
  return String(team ?? '')
    .replace(/\b(FC|CF|AFC|SC|SV|UD)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getAliases(teamName) {
  const aliases = TEAM_ALIASES[teamName];
  if (aliases?.length) return aliases;

  const simplified = simplifyTeamName(teamName);
  return simplified ? [simplified, teamName] : [teamName];
}

function matchTeamInTitle(title, teamName) {
  const normalizedTitle = normalizeText(title);
  return getAliases(teamName).some((alias) =>
    normalizedTitle.includes(normalizeText(alias))
  );
}

function hasHighlightKeyword(title) {
  const normalizedTitle = normalizeText(title);
  return HIGHLIGHT_KEYWORDS.some((word) =>
    normalizedTitle.includes(normalizeText(word))
  );
}

function isLikelyShort(title) {
  const normalizedTitle = normalizeText(title);
  return SHORTS_KEYWORDS.some((word) =>
    normalizedTitle.includes(normalizeText(word))
  );
}

function leagueMatchesTitle(title, league) {
  const normalizedTitle = normalizeText(title);
  const keywords = LEAGUE_KEYWORDS[league] ?? [];
  return keywords.some((keyword) =>
    normalizedTitle.includes(normalizeText(keyword))
  );
}

function getSeasonLabel(datetime) {
  if (!datetime) return null;

  const date = new Date(datetime);
  if (Number.isNaN(date.getTime())) return null;

  const month = date.getUTCMonth() + 1;
  const startYear = month >= 7 ? date.getUTCFullYear() : date.getUTCFullYear() - 1;
  const endYear = startYear + 1;

  const shortStart = String(startYear).slice(-2);
  const shortEnd = String(endYear).slice(-2);

  return `${shortStart}/${shortEnd}`;
}

function seasonMatchesTitle(title, datetime) {
  const seasonLabel = getSeasonLabel(datetime);
  if (!seasonLabel) return false;

  const normalizedTitle = normalizeText(title);
  return (
    normalizedTitle.includes(normalizeText(seasonLabel)) ||
    normalizedTitle.includes(normalizeText(seasonLabel.replace('/', '-'))) ||
    normalizedTitle.includes(normalizeText(`20${seasonLabel}`))
  );
}

function matchdayMatchesTitle(title, matchday) {
  if (!matchday) return false;

  const normalizedTitle = normalizeText(title);
  return (
    normalizedTitle.includes(normalizeText(`第${matchday}節`)) ||
    normalizedTitle.includes(normalizeText(`matchday ${matchday}`)) ||
    normalizedTitle.includes(normalizeText(`md${matchday}`))
  );
}

function recencyScore(publishedAt, matchDatetime) {
  const publishedTs = publishedAt ? Date.parse(publishedAt) : NaN;
  if (!Number.isFinite(publishedTs)) return 0;

  const referenceTs = matchDatetime ? Date.parse(matchDatetime) : Date.now();
  if (!Number.isFinite(referenceTs)) return 0;

  const diffHours = Math.abs(referenceTs - publishedTs) / (1000 * 60 * 60);

  if (diffHours <= 12) return 10;
  if (diffHours <= 36) return 7;
  if (diffHours <= 72) return 4;
  if (diffHours <= 168) return 1;
  return -2;
}

function scoreVideoTitle({ title, homeTeam, awayTeam, league, matchday, datetime }) {
  let score = 0;

  const homeMatched = matchTeamInTitle(title, homeTeam);
  const awayMatched = matchTeamInTitle(title, awayTeam);

  if (homeMatched) score += 10;
  if (awayMatched) score += 10;
  if (homeMatched && awayMatched) score += 12;

  if (hasHighlightKeyword(title)) score += 15;
  if (leagueMatchesTitle(title, league)) score += 6;
  if (seasonMatchesTitle(title, datetime)) score += 4;
  if (matchdayMatchesTitle(title, matchday)) score += 20;
  if (isLikelyShort(title)) score -= 20;

  return score;
}

function buildChannelSearchQueries({ homeTeam, awayTeam, league, matchday, datetime }) {
  const homeAliases = getAliases(homeTeam);
  const awayAliases = getAliases(awayTeam);
  const seasonLabel = getSeasonLabel(datetime);

  const queries = [];

  for (const home of homeAliases.slice(0, 4)) {
    for (const away of awayAliases.slice(0, 4)) {
      queries.push(`${home} ${away} ハイライト`);
      queries.push(`${home} ${away} highlight`);
      queries.push(`${home} ${away} ${league} ハイライト`);
      queries.push(`${home} ${away} ${league} highlight`);

      if (matchday) {
        queries.push(`${home} ${away} 第${matchday}節 ハイライト`);
        queries.push(`${home} ${away} 第${matchday}節`);
        queries.push(`${home} ${away} matchday ${matchday} highlight`);
      }

      if (seasonLabel) {
        queries.push(`${home} ${away} ${seasonLabel} ハイライト`);
        queries.push(`${home} ${away} ${seasonLabel} highlight`);
        queries.push(`${home} ${away} ${seasonLabel.replace('/', '-')} ハイライト`);
      }
    }
  }

  return Array.from(new Set(queries));
}

function mapMatch(item) {
  const code = item.competition?.code;
  const league = leagueMap[code] ?? item.competition?.name ?? 'Unknown League';
  const finished = item.status === 'FINISHED';

  return {
    id: String(item.id),
    homeTeam: item.homeTeam?.name ?? 'Home Team',
    awayTeam: item.awayTeam?.name ?? 'Away Team',
    league,
    datetime: item.utcDate,
    status: finished ? 'finished' : 'upcoming',
    matchday: item.matchday ?? null,
    score:
      finished && item.score?.fullTime
        ? {
            home: item.score.fullTime.home ?? 0,
            away: item.score.fullTime.away ?? 0,
          }
        : undefined,
    highlightSources: [],
  };
}

function flattenPlaylistQueryList(league, channelId) {
  return PLAYLIST_QUERIES[league]?.[channelId] ?? [];
}

// =========================
// football-data API
// =========================

let recentMatchesCache = null;
let recentMatchesCacheTime = 0;
const RECENT_MATCHES_CACHE_MS = 60 * 1000;

async function footballRequest(pathname, searchParams = {}, retryCount = 0) {
  if (!FOOTBALL_DATA_API_KEY) {
    throw new Error('Missing FOOTBALL_DATA_API_KEY');
  }

  const url = new URL(`https://api.football-data.org/v4/${pathname}`);
  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    headers: {
      'X-Auth-Token': FOOTBALL_DATA_API_KEY,
    },
  });

  // 👇ここ追加（超重要）
  if (response.status === 429 && retryCount < 2) {
    console.log('Rate limited (429). Waiting 5 seconds...');
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return footballRequest(pathname, searchParams, retryCount + 1);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`football-data error: ${response.status} ${body}`.trim());
  }

  return response.json();
}

async function fetchRecentMatches() {
  const nowMs = Date.now();

  if (
    recentMatchesCache &&
    nowMs - recentMatchesCacheTime < RECENT_MATCHES_CACHE_MS
  ) {
    console.log('Returning cached recent matches');
    return recentMatchesCache;
  }

  const now = new Date();
  const dateFrom = new Date(now);
  const dateTo = new Date(now);

  dateFrom.setUTCDate(now.getUTCDate() - 7);
  dateTo.setUTCDate(now.getUTCDate() + 2);

  const from = dateFrom.toISOString().slice(0, 10);
  const to = dateTo.toISOString().slice(0, 10);

  console.log('Fetching recent matches from', from, 'to', to);

  const data = await footballRequest('matches', {
    dateFrom: from,
    dateTo: to,
  });

  const matches = (data.matches ?? [])
    .filter((match) => allowedCodes.has(match.competition?.code))
    .map(mapMatch)
    .sort((a, b) => Date.parse(b.datetime) - Date.parse(a.datetime));

  recentMatchesCache = matches;
  recentMatchesCacheTime = nowMs;

  console.log('Fetched and cached recent matches:', matches.length);
  return matches;
}

async function fetchMatch(matchId) {
  if (!/^\d+$/.test(String(matchId))) {
    throw new Error('Invalid match id');
  }

  try {
    const data = await footballRequest(`matches/${matchId}`);
    return mapMatch(data.match);
  } catch {
    const recent = await fetchRecentMatches();
    const found = recent.find((match) => match.id === String(matchId));
    if (found) return found;
    throw new Error('Match not found');
  }
}

// =========================
// YouTube API helpers
// =========================
async function youtubeRequest(pathname, searchParams = {}) {
  if (!YOUTUBE_API_KEY) {
    throw new Error('Missing YOUTUBE_API_KEY');
  }

  const url = new URL(`https://www.googleapis.com/youtube/v3/${pathname}`);
  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }
  url.searchParams.set('key', YOUTUBE_API_KEY);

  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`youtube error: ${response.status} ${body}`.trim());
  }

  return response.json();
}

function scoreChannelCandidate(channelConfig, item) {
  const title = normalizeText(item.snippet?.title ?? '');
  let score = 0;

  if (title === normalizeText(channelConfig.label)) score += 30;

  for (const alias of channelConfig.channelTitleAliases ?? []) {
    if (title.includes(normalizeText(alias))) score += 10;
  }

  if (title.includes(normalizeText(channelConfig.label))) score += 20;

  return score;
}

async function resolveOfficialChannel(channelConfig) {
  if (channelCache.has(channelConfig.id)) {
    return channelCache.get(channelConfig.id);
  }

  const searchData = await youtubeRequest('search', {
    part: 'snippet',
    type: 'channel',
    q: channelConfig.channelQuery,
    maxResults: 5,
  });

  const candidates = searchData.items ?? [];
  if (!candidates.length) {
    channelCache.set(channelConfig.id, null);
    return null;
  }

  let bestCandidate = null;
  let bestScore = -Infinity;

  for (const item of candidates) {
    const score = scoreChannelCandidate(channelConfig, item);
    if (score > bestScore) {
      bestScore = score;
      bestCandidate = item;
    }
  }

  const channelId = bestCandidate?.id?.channelId;
  if (!channelId) {
    channelCache.set(channelConfig.id, null);
    return null;
  }

  const channelData = await youtubeRequest('channels', {
    part: 'snippet,contentDetails',
    id: channelId,
  });

  const channelItem = channelData.items?.[0];
  const uploadsPlaylistId = channelItem?.contentDetails?.relatedPlaylists?.uploads;

  const resolved = channelItem
    ? {
        channelId,
        uploadsPlaylistId,
        title: channelItem.snippet?.title ?? channelConfig.label,
      }
    : null;

  channelCache.set(channelConfig.id, resolved);
  return resolved;
}

async function fetchLatestUploads(uploadsPlaylistId) {
  if (!uploadsPlaylistId) return [];

  if (uploadsCache.has(uploadsPlaylistId)) {
    return uploadsCache.get(uploadsPlaylistId);
  }

  const playlistData = await youtubeRequest('playlistItems', {
    part: 'snippet,contentDetails',
    playlistId: uploadsPlaylistId,
    maxResults: 25,
  });

  const items = playlistData.items ?? [];
  uploadsCache.set(uploadsPlaylistId, items);
  return items;
}

async function searchPlaylistsInChannel({ channelId, query }) {
  const cacheKey = `${channelId}::${query}`;
  if (playlistSearchCache.has(cacheKey)) {
    return playlistSearchCache.get(cacheKey);
  }

  const data = await youtubeRequest('search', {
    part: 'snippet',
    channelId,
    type: 'playlist',
    q: query,
    maxResults: 10,
  });

  const items = data.items ?? [];
  playlistSearchCache.set(cacheKey, items);
  return items;
}

async function fetchPlaylistVideos(playlistId) {
  if (!playlistId) return [];
  if (playlistItemsCache.has(playlistId)) {
    return playlistItemsCache.get(playlistId);
  }

  const data = await youtubeRequest('playlistItems', {
    part: 'snippet,contentDetails',
    playlistId,
    maxResults: 50,
  });

  const items = data.items ?? [];
  playlistItemsCache.set(playlistId, items);
  return items;
}

async function searchVideosInResolvedChannel({ channelId, query }) {
  const data = await youtubeRequest('search', {
    part: 'snippet',
    channelId,
    type: 'video',
    q: query,
    order: 'date',
    maxResults: 10,
  });

  return data.items ?? [];
}

// =========================
// Candidate collection
// =========================
function buildCandidateFromItem({
  channel,
  title,
  videoId,
  publishedAt,
  homeTeam,
  awayTeam,
  league,
  matchday,
  datetime,
}) {
  if (!videoId) return null;

  const homeMatched = matchTeamInTitle(title, homeTeam);
  const awayMatched = matchTeamInTitle(title, awayTeam);
  const highlightMatched = hasHighlightKeyword(title);

  if (!highlightMatched) return null;
  if (!homeMatched || !awayMatched) return null;

  const score =
    scoreVideoTitle({
      title,
      homeTeam,
      awayTeam,
      league,
      matchday,
      datetime,
    }) +
    recencyScore(publishedAt, datetime) +
    (10 - channel.priority);

  return {
    sourceId: channel.id,
    sourceName: channel.label,
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    channelUrl: channel.channelUrl,
    isRecommended: channel.priority === 1,
    score,
    title,
    publishedAt,
  };
}

async function collectCandidatesFromPlaylist({
  channel,
  resolvedChannel,
  league,
  homeTeam,
  awayTeam,
  datetime,
  matchday,
}) {
  const queries = flattenPlaylistQueryList(league, channel.id);
  if (!queries.length) return [];

  let playlistCandidates = [];

  for (const query of queries) {
    const playlistResults = await searchPlaylistsInChannel({
      channelId: resolvedChannel.channelId,
      query,
    });

    debugLog(
      'PLAYLIST SEARCH RESULTS:',
      channel.label,
      query,
      playlistResults.slice(0, 5).map((item) => ({
        title: item.snippet?.title,
        playlistId: item.id?.playlistId,
      }))
    );

    for (const playlist of playlistResults) {
      const playlistId = playlist.id?.playlistId;
      if (!playlistId) continue;

      const playlistItems = await fetchPlaylistVideos(playlistId);

      debugLog(
        'PLAYLIST VIDEOS:',
        channel.label,
        query,
        playlistItems.slice(0, 10).map((item) => ({
          title: item.snippet?.title,
          publishedAt: item.contentDetails?.videoPublishedAt ?? item.snippet?.publishedAt,
        }))
      );

      for (const item of playlistItems) {
        const title = item.snippet?.title ?? '';
        const videoId = item.contentDetails?.videoId;
        const publishedAt = item.contentDetails?.videoPublishedAt ?? item.snippet?.publishedAt;

        const candidate = buildCandidateFromItem({
          channel,
          title,
          videoId,
          publishedAt,
          homeTeam,
          awayTeam,
          league,
          matchday,
          datetime,
        });

        if (candidate) {
          playlistCandidates.push(candidate);
        }
      }

      if (playlistCandidates.length > 0) {
        break;
      }
    }

    if (playlistCandidates.length > 0) {
      break;
    }
  }

  return playlistCandidates;
}

async function collectCandidatesFromChannelSearch({
  channel,
  resolvedChannel,
  league,
  homeTeam,
  awayTeam,
  datetime,
  matchday,
}) {
  const queries = buildChannelSearchQueries({
    homeTeam,
    awayTeam,
    league,
    matchday,
    datetime,
  });

  const candidates = [];

  debugLog('FALLBACK SEARCH QUERIES:', channel.label, queries.slice(0, 10));

  for (const query of queries.slice(0, 12)) {
    const items = await searchVideosInResolvedChannel({
      channelId: resolvedChannel.channelId,
      query,
    });

    debugLog(
      'FALLBACK RESULTS:',
      channel.label,
      query,
      items.slice(0, 5).map((item) => ({
        title: item.snippet?.title,
        publishedAt: item.snippet?.publishedAt,
      }))
    );

    for (const item of items) {
      const title = item.snippet?.title ?? '';
      const videoId = item.id?.videoId;
      const publishedAt = item.snippet?.publishedAt;

      const candidate = buildCandidateFromItem({
        channel,
        title,
        videoId,
        publishedAt,
        homeTeam,
        awayTeam,
        league,
        matchday,
        datetime,
      });

      if (candidate) {
        candidates.push(candidate);
      }
    }

    if (candidates.length > 0) break;
  }

  return candidates;
}

async function collectCandidatesFromUploads({
  channel,
  resolvedChannel,
  league,
  homeTeam,
  awayTeam,
  datetime,
  matchday,
}) {
  const uploads = await fetchLatestUploads(resolvedChannel.uploadsPlaylistId);
  if (!uploads.length) return [];

  debugLog(
    'UPLOAD TITLES:',
    channel.label,
    uploads.slice(0, 10).map((item) => ({
      title: item.snippet?.title,
      publishedAt: item.contentDetails?.videoPublishedAt ?? item.snippet?.publishedAt,
    }))
  );

  const candidates = [];

  for (const item of uploads) {
    const title = item.snippet?.title ?? '';
    const videoId = item.contentDetails?.videoId;
    const publishedAt = item.contentDetails?.videoPublishedAt ?? item.snippet?.publishedAt;

    const homeMatched = matchTeamInTitle(title, homeTeam);
    const awayMatched = matchTeamInTitle(title, awayTeam);
    const highlightMatched = hasHighlightKeyword(title);
    const matchdayMatched = matchday ? matchdayMatchesTitle(title, matchday) : false;

    debugLog('TITLE CHECK:', {
      channel: channel.label,
      title,
      homeMatched,
      awayMatched,
      highlightMatched,
      matchdayMatched,
    });

    const candidate = buildCandidateFromItem({
      channel,
      title,
      videoId,
      publishedAt,
      homeTeam,
      awayTeam,
      league,
      matchday,
      datetime,
    });

    if (candidate) {
      candidates.push(candidate);
    }
  }

  return candidates;
}

// =========================
// Highlight matching
// =========================
async function bestVideoForChannel({ channel, homeTeam, awayTeam, league, language, datetime, matchday }) {
  const resolvedChannel = await resolveOfficialChannel(channel);
  if (!resolvedChannel?.channelId) {
    debugLog('NO RESOLVED CHANNEL:', channel.label);
    return null;
  }

  let candidates = [];

  // 1) プレイリスト優先
  candidates = await collectCandidatesFromPlaylist({
    channel,
    resolvedChannel,
    league,
    homeTeam,
    awayTeam,
    datetime,
    matchday,
  });

  // 2) チャンネル内検索 fallback
  if (candidates.length === 0) {
    candidates = await collectCandidatesFromChannelSearch({
      channel,
      resolvedChannel,
      league,
      homeTeam,
      awayTeam,
      datetime,
      matchday,
    });
  }

  // 3) uploads は最後の保険
  if (candidates.length === 0 && resolvedChannel.uploadsPlaylistId) {
    candidates = await collectCandidatesFromUploads({
      channel,
      resolvedChannel,
      league,
      homeTeam,
      awayTeam,
      datetime,
      matchday,
    });
  }

  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return Date.parse(b.publishedAt ?? '') - Date.parse(a.publishedAt ?? '');
  });

  debugLog('CHANNEL CHECK:', channel.label);
  debugLog(
    'TOP CANDIDATES:',
    candidates.slice(0, 5).map((candidate) => ({
      title: candidate.title,
      score: candidate.score,
      publishedAt: candidate.publishedAt,
    }))
  );

  const best = candidates[0];
  if (!best) return null;
  if (best.score < 20) return null;

  return {
    sourceId: best.sourceId,
    sourceName: best.sourceName,
    videoUrl: best.videoUrl,
    channelUrl: best.channelUrl,
    isRecommended: best.isRecommended,
    score: best.score,
  };
}

async function fetchHighlightSources({
  league,
  homeTeam,
  awayTeam,
  language,
  status,
  datetime,
  matchday,
}) {
  const channelIds = COMPETITION_CHANNELS[String(league).trim()] ?? [];
  const allowedChannels = channelIds.map((id) => CHANNELS[id]).filter(Boolean);

  debugLog('LEAGUE INPUT:', league);
  debugLog('CHANNEL IDS:', channelIds);

  if (!allowedChannels.length) {
    return {
      sources: [],
      statusMessage: 'No official highlights available yet',
    };
  }

  if (status !== 'finished') {
    return {
      sources: allowedChannels.map((channel) => ({
        sourceId: channel.id,
        sourceName: channel.label,
        channelUrl: channel.channelUrl,
        isRecommended: channel.priority === 1,
      })),
      statusMessage: 'ハイライトは試合終了後に公開されることが多いです。',
    };
  }

  const results = await Promise.all(
    allowedChannels.map((channel) =>
      bestVideoForChannel({
        channel,
        homeTeam,
        awayTeam,
        league,
        language,
        datetime,
        matchday,
      })
    )
  );

  const directSources = results
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.sourceName.localeCompare(b.sourceName))
    .map(({ score, ...rest }) => rest);

  if (directSources.length > 0) {
    return {
      sources: directSources,
    };
  }

  return {
    sources: allowedChannels.map((channel) => ({
      sourceId: channel.id,
      sourceName: channel.label,
      channelUrl: channel.channelUrl,
      isRecommended: channel.priority === 1,
    })),
    statusMessage: 'まだ公式ハイライトが見つかりません。',
  };
}

// =========================
// HTTP server
// =========================
const server = http.createServer(async (req, res) => {
  if (!req.url) {
    return sendJson(res, 404, { message: 'Not found' });
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  try {
    if (url.pathname === '/api/matches/recent' && req.method === 'GET') {
      const matches = await fetchRecentMatches();
      return sendJson(res, 200, matches);
    }

    if (url.pathname.startsWith('/api/matches/') && req.method === 'GET') {
      const matchId = url.pathname.split('/').pop();
      if (!matchId) {
        return sendJson(res, 400, { message: 'Missing match id' });
      }

      const match = await fetchMatch(matchId);
      return sendJson(res, 200, match);
    }

    if (url.pathname === '/api/highlights/search' && req.method === 'GET') {
      const league = url.searchParams.get('league') ?? '';
      const homeTeam = url.searchParams.get('homeTeam') ?? '';
      const awayTeam = url.searchParams.get('awayTeam') ?? '';
      const status = url.searchParams.get('status') ?? 'finished';
      const datetime = url.searchParams.get('datetime') ?? '';
      const matchdayParam = url.searchParams.get('matchday');
      const language = url.searchParams.get('language') === 'en' ? 'en' : 'ja';

      const result = await fetchHighlightSources({
        league,
        homeTeam,
        awayTeam,
        language,
        status,
        datetime,
        matchday: matchdayParam ? Number(matchdayParam) : null,
      });

      return sendJson(res, 200, result);
    }

    return sendJson(res, 404, { message: 'Not found' });
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

server.listen(PORT, () => {
  console.log(`API server listening on ${PORT}`);
});