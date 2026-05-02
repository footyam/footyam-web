import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { URL } from 'node:url';

/**
 * FootyAM playlist-safe API server
 * Full replacement version
 * - No public search.list flow
 * - Playlist monitoring only
 * - Cache persistence
 * - Same basic endpoints kept
 */

// =========================
// env
// =========================
loadEnvFile();

const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const PORT = Number(process.env.PORT ?? 8787);
const DEBUG = true;

// =========================
// files
// =========================
const DATA_DIR = process.cwd();
const HIGHLIGHT_CACHE_FILE = path.join(DATA_DIR, 'highlight-cache.json');
const PLAYLIST_STATE_FILE = path.join(DATA_DIR, 'playlist-state.json');
const LEARNING_LOG_FILE = path.join(DATA_DIR, 'highlight-learning.json');

// =========================
// leagues
// =========================
const TOP_LEAGUES = ['PL', 'PD', 'BL1', 'SA', 'FL1'];

const leagueMap = {
  PL: 'Premier League',
  PD: 'La Liga',
  BL1: 'Bundesliga',
  SA: 'Serie A',
  FL1: 'Ligue 1',
};

const allowedCodes = new Set(TOP_LEAGUES);

// =========================
// channels
// =========================
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

// =========================
// real playlists
// =========================
const LEAGUE_PLAYLISTS = {
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

// =========================
// team aliases (minimal)
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
  'Manchester City FC': ['Manchester City', 'Man City', 'マンチェスター・シティ', 'マンチェスターシティ', 'マンチェスター・C', 'マンC'],
  'Manchester United FC': ['Manchester United', 'Man United', 'Man Utd', 'マンチェスター・ユナイテッド', 'マンチェスターユナイテッド', 'マンチェスター・U', 'マンU'],
  'Newcastle United FC': ['Newcastle', 'Newcastle United', 'ニューカッスル'],
  'Nottingham Forest FC': ['Nottingham Forest', 'Forest', 'ノッティンガム・フォレスト', 'ノッティンガムフォレスト'],
  'Sunderland AFC': ['Sunderland', 'サンダーランド'],
  'Tottenham Hotspur FC': ['Tottenham', 'Tottenham Hotspur', 'Spurs', 'スパーズ', 'トッテナム・ホットスパー', 'トッテナム'],
  'West Ham United FC': ['West Ham', 'West Ham United', 'ウェストハム', 'ウエストハム'],
  'Wolverhampton Wanderers FC': ['Wolverhampton', 'Wolves', 'Wolverhampton Wanderers', 'ウルヴス', 'ウルブス', 'ウォルヴァーハンプトン'],

  // La Liga
  'Athletic Club': ['Athletic Club', 'Athletic Bilbao', 'Bilbao', 'アスレティック・クルブ', 'アスレティック・ビルバオ', 'ビルバオ'],
  'Club Atlético de Madrid': ['Atlético de Madrid', 'Atletico Madrid', 'Atlético', 'Atletico', 'アトレティコ・マドリー', 'アトレティコ・デ・マドリー', 'アトレティコ・マドリード', 'アトレティコマドリード', 'アトレティコ'],
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
  'Real Madrid CF': ['Real Madrid', 'レアル・マドリー', 'レアルマドリー', 'レアル・マドリード', 'レアルマドリード'],
  'Real Oviedo': ['Real Oviedo', 'Oviedo', 'オビエド', 'レアル・オビエド'],
  'Real Sociedad de Fútbol': ['Real Sociedad', 'Sociedad', 'レアル・ソシエダ', 'ソシエダ'],
  'Sevilla FC': ['Sevilla', 'Sevilla FC', 'セビージャ'],
  'Valencia CF': ['Valencia', 'Valencia CF', 'バレンシア'],
  'Villarreal CF': ['Villarreal', 'Villarreal CF', 'ビジャレアル'],

  // Bundesliga
  'FC Bayern München': ['FC Bayern München', 'Bayern Munich', 'Bayern', 'バイエルン', 'バイエルン・ミュンヘン'],
  'Bayer 04 Leverkusen': ['Bayer Leverkusen', 'Leverkusen', 'レヴァークーゼン', 'レバークーゼン'],
  'Eintracht Frankfurt': ['Eintracht Frankfurt', 'Frankfurt', 'フランクフルト'],
  'Borussia Dortmund': ['Borussia Dortmund', 'Dortmund', 'BVB', 'ドルトムント'],
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

  // Serie A
  'Juventus FC': ['Juventus', 'Juventus FC', 'ユヴェントス'],
  'FC Internazionale Milano': ['Inter', 'Inter Milan', 'Internazionale', 'インテル'],
  'AC Milan': ['AC Milan', 'Milan', 'ミラン'],
  'SSC Napoli': ['Napoli', 'SSC Napoli', 'ナポリ'],
  'AS Roma': ['Roma', 'AS Roma', 'ローマ'],
  'SS Lazio': ['Lazio', 'SS Lazio', 'ラツィオ'],
  'Atalanta BC': ['Atalanta', 'Atalanta BC', 'アタランタ'],
  'ACF Fiorentina': ['Fiorentina', 'ACF Fiorentina', 'フィオレンティーナ'],
  'Torino FC': ['Torino', 'Torino FC', 'トリノ'],
  'Bologna FC 1909': ['Bologna', 'Bologna FC', 'ボローニャ'],
  'Genoa CFC': ['Genoa', 'Genoa CFC', 'ジェノア'],
  'Hellas Verona FC': ['Hellas Verona', 'Verona', 'ヴェローナ'],
  'Cagliari Calcio': ['Cagliari', 'カリアリ'],
  'US Sassuolo Calcio': ['Sassuolo', 'US Sassuolo', 'サッスオーロ'],
  'Udinese Calcio': ['Udinese', 'Udinese Calcio', 'ウディネーゼ'],
  'US Lecce': ['Lecce', 'US Lecce', 'レッチェ'],
  'Parma Calcio 1913': ['Parma', 'Parma Calcio', 'パルマ'],
  'Como 1907': ['Como', 'Como 1907', 'コモ'],
  'US Cremonese': ['Cremonese', 'US Cremonese', 'クレモネーゼ'],
  'AC Pisa 1909': ['Pisa', 'AC Pisa', 'ピサ'],

  // Ligue 1
  'Paris Saint-Germain FC': ['Paris Saint-Germain', 'PSG', 'Paris SG', 'パリ・サンジェルマン', 'パリSG'],
  'Olympique de Marseille': ['Marseille', 'Olympique de Marseille', 'マルセイユ'],
  'AS Monaco FC': ['Monaco', 'AS Monaco', 'モナコ'],
  'Olympique Lyonnais': ['Lyon', 'Olympique Lyonnais', 'リヨン'],
  'LOSC Lille': ['Lille', 'LOSC Lille', 'リール'],
  'Stade Rennais FC 1901': ['Rennes', 'Stade Rennais', 'レンヌ'],
  'RC Lens': ['Lens', 'RC Lens', 'ランス'],
  'OGC Nice': ['Nice', 'OGC Nice', 'ニース'],
  'FC Nantes': ['Nantes', 'FC Nantes', 'ナント'],
  'Montpellier HSC': ['Montpellier', 'Montpellier HSC', 'モンペリエ'],
  'Toulouse FC': ['Toulouse', 'Toulouse FC', 'トゥールーズ'],
  'RC Strasbourg Alsace': ['Strasbourg', 'RC Strasbourg', 'ストラスブール'],
  'Stade Brestois 29': ['Brest', 'Stade Brestois', 'ブレスト'],
  'Le Havre AC': ['Le Havre', 'Le Havre AC', 'ル・アーヴル'],
  'FC Metz': ['Metz', 'FC Metz', 'メス'],
  'AJ Auxerre': ['Auxerre', 'AJ Auxerre', 'オセール'],
  'FC Lorient': ['Lorient', 'FC Lorient', 'ロリアン'],
  'Angers SCO': ['Angers', 'Angers SCO', 'アンジェ'],
  'Paris FC': ['Paris FC', 'パリFC'],
};

// =========================
// memory state
// =========================
let recentMatchesCache = null;
let recentMatchesCacheTime = 0;

const RECENT_MATCHES_CACHE_MS = 60 * 1000;

const highlightState = new Map();
const playlistState = new Map();
const learningLogs = [];
const notifications = [];

// =========================
// helpers
// =========================
function addNotification(notification) {
  notifications.unshift({
    ...notification,
    id: `${notification.matchId}-${notification.sourceId}-${Date.now()}`,
  });

  if (notifications.length > 50) {
    notifications.pop();
  }
}

function getNotifications() {
  return notifications.slice(0, 100);
}

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  const text = fs.readFileSync(envPath, 'utf8');

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;

    const idx = line.indexOf('=');
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();

    if (!process.env[key]) process.env[key] = value;
  }
}

function debug(...args) {
  if (DEBUG) console.log(...args);
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
  });

  res.end(JSON.stringify(payload));
}

function normalize(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[×x]/g, ' ')
    .replace(/[【】\[\]()（）|｜:：,，.!?？・]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getAliases(team) {
  return TEAM_ALIASES[team] ?? [team];
}

function titleHasTeam(title, team) {
  const t = normalize(title);
  return getAliases(team).some((a) => t.includes(normalize(a)));
}

function safeReadJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function safeWriteJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function loadPersistentState() {
  const cache = safeReadJson(HIGHLIGHT_CACHE_FILE, {});
  for (const [k, v] of Object.entries(cache)) {
    highlightState.set(k, v);
  }

  const pState = safeReadJson(PLAYLIST_STATE_FILE, {});
  for (const [k, v] of Object.entries(pState)) {
    playlistState.set(k, v);
  }

  const logs = safeReadJson(LEARNING_LOG_FILE, []);
  for (const item of logs) learningLogs.push(item);
}

function saveHighlightState() {
  const obj = Object.fromEntries(highlightState.entries());
  safeWriteJson(HIGHLIGHT_CACHE_FILE, obj);
}

function savePlaylistState() {
  const obj = Object.fromEntries(playlistState.entries());
  safeWriteJson(PLAYLIST_STATE_FILE, obj);
}

function saveLearningLogs() {
  safeWriteJson(LEARNING_LOG_FILE, learningLogs);
}

// =========================
// football-data
// =========================
async function footballRequest(pathname, searchParams = {}) {
  const url = new URL(`https://api.football-data.org/v4/${pathname}`);

  for (const [k, v] of Object.entries(searchParams)) {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url, {
    headers: {
      'X-Auth-Token': FOOTBALL_DATA_API_KEY,
    },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`football-data error ${res.status} ${txt}`);
  }

  return res.json();
}

function mapMatch(item) {
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

async function fetchRecentMatches() {
  const now = Date.now();

  if (
    recentMatchesCache &&
    now - recentMatchesCacheTime < RECENT_MATCHES_CACHE_MS
  ) {
    return recentMatchesCache;
  }

  const dateFrom = new Date();
  const dateTo = new Date();

  dateFrom.setUTCDate(dateFrom.getUTCDate() - 7);
  dateTo.setUTCDate(dateTo.getUTCDate() + 2);

  let all = [];
  let failed = false;

  for (const code of TOP_LEAGUES) {
    try {
      const data = await footballRequest(`competitions/${code}/matches`, {
        dateFrom: dateFrom.toISOString().slice(0, 10),
        dateTo: dateTo.toISOString().slice(0, 10),
      });

      all = all.concat(data.matches ?? []);
    } catch (e) {
      failed = true;
      console.error('skip', code, e instanceof Error ? e.message : e);
    }
  }

  // どれか失敗した時に、前回の正常キャッシュがあるならそれを使う
  if (failed && recentMatchesCache) {
    return recentMatchesCache;
  }

  // 初回で失敗してほぼ空なら、壊れたキャッシュを作らない
  if (failed && all.length === 0) {
    throw new Error('Failed to fetch recent matches');
  }

  const mapped = all
    .filter((m) => allowedCodes.has(m.competition?.code))
    .map(mapMatch)
    .sort((a, b) => Date.parse(b.datetime) - Date.parse(a.datetime));

  recentMatchesCache = mapped;
  recentMatchesCacheTime = now;

  return mapped;
}

async function fetchMatch(matchId) {
  const recent = await fetchRecentMatches();
  const found = recent.find((m) => m.id === String(matchId));

  if (found) return found;

  throw new Error('Match not found in recent cache');
}

// =========================
// youtube
// =========================
async function youtubeRequest(pathname, searchParams = {}) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${pathname}`);

  for (const [k, v] of Object.entries(searchParams)) {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v));
    }
  }

  url.searchParams.set('key', YOUTUBE_API_KEY);

  const res = await fetch(url);

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`youtube error ${res.status} ${txt}`);
  }

  return res.json();
}

async function fetchPlaylistItems(playlistId) {
  const data = await youtubeRequest('playlistItems', {
    part: 'snippet,contentDetails',
    playlistId,
    maxResults: 25,
  });

  return data.items ?? [];
}

// =========================
// matching
// =========================
function scoreVideoAgainstMatch(title, match) {
  const homeMatched = titleHasTeam(title, match.homeTeam);
  const awayMatched = titleHasTeam(title, match.awayTeam);

  // 両チーム一致しない動画は候補外
  if (!homeMatched || !awayMatched) return 0;

  const t = normalize(title);

  let score = 50;

  // ===== 最重要：ハイライト語 =====
  if (t.includes(normalize('ショートハイライト'))) score += 55;
  if (t.includes(normalize('ハイライト'))) score += 40;
  if (t.includes(normalize('ダイジェスト'))) score += 30;
  if (t.includes('highlight')) score += 40;
  if (t.includes('highlights')) score += 40;

  // ===== ニュース系・速報系 =====
  if (t.includes(normalize('速報'))) score -= 25;
  if (t.includes(normalize('緊急'))) score -= 15;
  if (t.includes(normalize('会見'))) score -= 20;
  if (t.includes(normalize('インタビュー'))) score -= 20;

  // ===== 補助ワード（弱減点）=====
  if (t.includes(normalize('優勝'))) score -= 5;
  if (t.includes(normalize('制覇'))) score -= 5;
  if (t.includes(normalize('連覇'))) score -= 5;
  if (t.includes(normalize('フル出場'))) score -= 8;
  if (t.includes(normalize('出場'))) score -= 4;

  // ===== 節一致 =====
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

function buildVideoUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

async function tryMatchVideoToRecentMatch({
  league,
  channel,
  playlistId,
  item,
  recent,
}) {
  const title = item?.snippet?.title ?? '';
  const videoId = item?.contentDetails?.videoId;

if (!videoId) return false;

  const candidates = recent.filter((m) => {
    if (m.league !== league || m.status !== 'finished') return false;

    const existing = highlightState.get(String(m.id));

    const existingVideos = Array.isArray(existing?.videos)
      ? existing.videos
      : existing?.video
        ? [existing.video]
        : [];

    // 同じチャンネルの動画がすでにある場合だけ除外
    return !existingVideos.some((video) => video.sourceId === channel.id);
  });

  let best = null;
  let bestScore = 0;




  for (const match of candidates) {
  const score = scoreVideoAgainstMatch(title, match);

  if (score > bestScore) {
    best = match;
    bestScore = score;
  }
}

if (!best || bestScore < 50) return false;

  const matchId = String(best.id);

  const existing = highlightState.get(matchId);

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
    ...existingVideos.filter((video) => video.sourceId !== newVideo.sourceId),
    newVideo,
  ].sort((a, b) => {
    if (Number(b.isRecommended) !== Number(a.isRecommended)) {
      return Number(b.isRecommended) - Number(a.isRecommended);
    }
    return a.sourceName.localeCompare(b.sourceName);
  });

  highlightState.set(matchId, {
    found: true,
    foundAt: existing?.foundAt ?? Date.now(),
    updatedAt: Date.now(),
    videos,
  });

  learningLogs.push({
    matchId,
    league,
    channel: channel.label,
    title,
    score: bestScore,
    foundAt: Date.now(),
  });

  saveHighlightState();
  saveLearningLogs();

  addNotification({
  matchId,
  sourceId: channel.id,
  sourceName: channel.label,
  homeTeam: best.homeTeam,
  awayTeam: best.awayTeam,
  league,
  videoUrl: newVideo.videoUrl,
  createdAt: Date.now(),
});

console.log("🔥 NOTIFICATION ADDED");

  debug(
    'matched',
    channel.label,
    title,
    '->',
    best.homeTeam,
    best.awayTeam,
    'score',
    bestScore
  );

return true;
}

// =========================
// monitor
// =========================
function buildPlaylistTargets() {
  return Object.entries(LEAGUE_PLAYLISTS).flatMap(([league, list]) =>
    list.map((row) => ({
      league,
      channel: CHANNELS[row.channelId],
      playlistId: row.playlistId,
    }))
  );
}

async function runPlaylistMonitorOnce() {
  const targets = buildPlaylistTargets();
  const recent = await fetchRecentMatches();

  for (const target of targets) {
    try {
      const items = await fetchPlaylistItems(target.playlistId);

      const prev =
        playlistState.get(target.playlistId) ??
        {
          lastSeenVideoIds: [],
          lastCheckedAt: null,
        };

      const previousSeenIds = Array.isArray(prev.lastSeenVideoIds)
        ? prev.lastSeenVideoIds
        : [];

      const currentIds = items
        .map((x) => x?.contentDetails?.videoId)
        .filter(Boolean);

      const seen = new Set(previousSeenIds);

      const itemsToProcess = previousSeenIds.length
        ? items.filter((x) => {
            const id = x?.contentDetails?.videoId;
            return id && !seen.has(id);
          })
        : items;

      const successfullyProcessedIds = [];

      for (const item of itemsToProcess.slice().reverse()) {
        const videoId = item?.contentDetails?.videoId;
        if (!videoId) continue;

        const matched = await tryMatchVideoToRecentMatch({
          league: target.league,
          channel: target.channel,
          playlistId: target.playlistId,
          item,
          recent,
        });

        if (matched) {
          successfullyProcessedIds.push(videoId);
        }
      }

      const nextSeenIds = [
        ...previousSeenIds,
        ...successfullyProcessedIds,
      ].filter((id, index, array) => array.indexOf(id) === index);

      playlistState.set(target.playlistId, {
        lastSeenVideoIds: nextSeenIds,
        lastCheckedAt: new Date().toISOString(),
      });

      savePlaylistState();
    } catch (e) {
      console.error('playlist monitor failed', target.playlistId, e);
    }
  }

  cleanupOldCache();
}

function startPlaylistMonitor() {
  runPlaylistMonitorOnce().catch(console.error);

  setInterval(() => {
    runPlaylistMonitorOnce().catch(console.error);
  }, 5 * 60 * 1000);
}

// =========================
// cleanup
// =========================
async function cleanupOldCache() {
  const recent = await fetchRecentMatches();
  const keep = new Set(recent.map((m) => String(m.id)));

  for (const key of [...highlightState.keys()]) {
    if (!keep.has(key)) {
      highlightState.delete(key);
    }
  }

  saveHighlightState();
}

// =========================
// response helper
// =========================
function getAllowedSourcesForLeague(league) {
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

function getHighlightResultForMatchObject(match) {
  const state = highlightState.get(String(match.id));

  if (state?.found) {
    const videos = Array.isArray(state.videos)
      ? state.videos
      : state.video
        ? [state.video]
        : [];

    if (videos.length > 0) {
      return {
        sources: videos,
      };
    }
  }

  return {
  sources: getAllowedSourcesForLeague(match.league),
  statusMessage: null,
};
}

// =========================
// server
// =========================
const server = http.createServer(async (req, res) => {
  if (!req.url) {
    return sendJson(res, 404, { message: 'Not found' });
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });

    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  try {
    if (url.pathname === '/api/matches/recent') {
      const matches = await fetchRecentMatches();
      return sendJson(res, 200, matches);
    }

    if (
      url.pathname.startsWith('/api/matches/') &&
      req.method === 'GET'
    ) {
      const matchId = url.pathname.split('/').pop();
      const match = await fetchMatch(matchId);
      return sendJson(res, 200, match);
    }

    if (
      url.pathname.startsWith('/api/highlights/by-match/') &&
      req.method === 'GET'
    ) {
      const matchId = url.pathname.split('/').pop();
      const match = await fetchMatch(matchId);

      return sendJson(
        res,
        200,
        getHighlightResultForMatchObject(match)
      );
    }

    if (
      url.pathname.startsWith('/api/highlights/refresh/') &&
      req.method === 'GET'
    ) {
      const matchId = url.pathname.split('/').pop();
      const match = await fetchMatch(matchId);

      // cache only (public safe)
      return sendJson(
        res,
        200,
        getHighlightResultForMatchObject(match)
      );
    }

    if (url.pathname === '/api/debug/highlight-logs') {
      return sendJson(res, 200, learningLogs);
    }

    if (url.pathname === '/api/notifications') {
  return sendJson(res, 200, {
    notifications: getNotifications(),
  });
}

    return sendJson(res, 404, { message: 'Not found' });
  } catch (error) {
    console.error(error);

    return sendJson(res, 500, {
      message:
        error instanceof Error
          ? error.message
          : 'Unknown error',
    });
  }
});

// =========================
// boot
// =========================
loadPersistentState();
startPlaylistMonitor();

server.listen(PORT, () => {
  console.log(`API server listening on ${PORT}`);
});