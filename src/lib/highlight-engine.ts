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

async function fetchRecentMatches(targetLeagueCode?: string) {
  const dateFrom = new Date();
  const dateTo = new Date();

  dateFrom.setUTCDate(dateFrom.getUTCDate() - 7);
  dateTo.setUTCDate(dateTo.getUTCDate() + 2);

  let all: any[] = [];

  const targetLeagues = targetLeagueCode ? [targetLeagueCode] : TOP_LEAGUES;

  for (const code of targetLeagues) {
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

  if (
    title.includes('エヴァートン') ||
    title.includes('チェルシー') ||
    title.includes('ノッティンガム') ||
    title.includes('マンチェスター')
  ) {
    console.log('DEBUG MATCH:', {
      title,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      homeMatched,
      awayMatched,
    });
  }

  if (!homeMatched || !awayMatched) return 0;

  const t = normalize(title);

  let score = 50;

  if (t.includes(normalize('ショートハイライト'))) score += 55;
  if (t.includes(normalize('ハイライト'))) score += 40;
  if (t.includes(normalize('ダイジェスト'))) score += 30;
  if (t.includes('highlight')) score += 40;
  if (t.includes('highlights')) score += 40;

  if (t.includes(normalize('速報'))) score -= 25;
  if (t.includes(normalize('緊急'))) score -= 15;
  if (t.includes(normalize('会見'))) score -= 20;
  if (t.includes(normalize('インタビュー'))) score -= 20;

  if (t.includes(normalize('優勝'))) score -= 5;
  if (t.includes(normalize('制覇'))) score -= 5;
  if (t.includes(normalize('連覇'))) score -= 5;
  if (t.includes(normalize('フル出場'))) score -= 8;
  if (t.includes(normalize('出場'))) score -= 4;

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

function getVideos(existing: any) {
  return Array.isArray(existing?.videos)
    ? existing.videos
    : existing?.video
      ? [existing.video]
      : [];
}

export async function runHighlightMonitorOnce(targetLeagueCode?: string) {
  const recent = await fetchRecentMatches(targetLeagueCode);
  const finished = recent.filter((m) => m.status === 'finished');

  const state = await loadHighlightState();

  let matchedCount = 0;

  for (const [league, rows] of Object.entries(LEAGUE_PLAYLISTS)) {
    if (targetLeagueCode && leagueMap[targetLeagueCode] !== league) continue;

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

          const matchId = String(match.id);
          const existingVideos = getVideos(state[matchId]);

          // 同じチャンネルのショートハイライトは1試合につき最大1本
          // すでにこのチャンネルが埋まっている試合には、別動画を再割り当てしない
          if (existingVideos.some((video: any) => video.sourceId === channel.id)) {
            continue;
          }

          const score = scoreVideoAgainstMatch(title, match);

          if (score > bestScore) {
            best = match;
            bestScore = score;
          }
        }

        if (!best || bestScore < 50) continue;

        const matchId = String(best.id);
        const existing = state[matchId];
        const existingVideos = getVideos(existing);

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
    league: targetLeagueCode ?? 'ALL',
  };
}