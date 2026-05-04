import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null;

export async function loadHighlightState() {
  if (!supabase) {
    console.error('Supabase env vars are missing.');
    return {};
  }

  const { data, error } = await supabase
    .from('highlights')
    .select('*');

  if (error) {
    console.error('Failed to load highlights from Supabase:', error);
    return {};
  }

  const state: Record<string, any> = {};

  for (const row of data ?? []) {
    const matchId = String(row.match_id);

    if (!state[matchId]) {
      state[matchId] = {
        found: true,
        foundAt: row.found_at ?? Date.now(),
        updatedAt: row.updated_at ?? Date.now(),
        videos: [],
      };
    }

    state[matchId].videos.push({
      sourceId: row.source_id,
      sourceName: row.source_name,
      channelUrl: row.channel_url,
      videoUrl: row.video_url,
      isRecommended: row.is_recommended ?? false,
    });

    state[matchId].updatedAt = Math.max(
      state[matchId].updatedAt,
      row.updated_at ?? 0
    );
  }

  return state;
}

export async function saveHighlightState(data: any) {
  if (!supabase) {
    console.error('Supabase env vars are missing.');
    return;
  }

  const rows = Object.entries(data ?? {}).flatMap(([matchId, value]: [string, any]) => {
    const videos = value?.videos ?? [];

    return videos
      .filter((video: any) => video?.sourceId && video?.videoUrl)
      .map((video: any) => ({
        match_id: String(matchId),
        source_id: video.sourceId,
        source_name: video.sourceName,
        channel_url: video.channelUrl ?? null,
        video_url: video.videoUrl,
        is_recommended: video.isRecommended ?? false,
        found_at: value.foundAt ?? Date.now(),
        updated_at: Date.now(),
      }));
  });

  if (rows.length === 0) return;

  const { error } = await supabase
    .from('highlights')
    .upsert(rows, {
      onConflict: 'match_id,source_id',
    });

  if (error) {
    console.error('Failed to save highlights to Supabase:', error);
    throw error;
  }
}