import { put, list } from '@vercel/blob';

const BLOB_KEY = 'highlight-state.json';

// 読み込み
export async function loadHighlightState() {
  const blobs = await list({ prefix: BLOB_KEY });

  if (!blobs.blobs.length) {
    return {};
  }

  const url = blobs.blobs[0].url;
  const res = await fetch(url);
  return res.json();
}

// 保存（上書き）
export async function saveHighlightState(data: any) {
  await put(BLOB_KEY, JSON.stringify(data), {
    access: 'public',
    addRandomSuffix: false,
  });
}