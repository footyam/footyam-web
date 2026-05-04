import { put, list } from '@vercel/blob';

const BLOB_KEY = 'highlight-state.json';

export async function loadHighlightState() {
  try {
    const blobs = await list({ prefix: BLOB_KEY });

    const blob = blobs.blobs.find((b) => b.pathname === BLOB_KEY);

    if (!blob) {
      return {};
    }

    const res = await fetch(blob.url, {
      cache: 'no-store',
    });

    const text = await res.text();

    if (!res.ok) {
      console.error('Failed to fetch highlight state blob:', res.status, text.slice(0, 200));
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      console.error('Highlight state blob is not valid JSON:', text.slice(0, 200));
      return {};
    }
  } catch (err) {
    console.error('Failed to load highlight state:', err);
    return {};
  }
}

export async function saveHighlightState(data: any) {
  await put(BLOB_KEY, JSON.stringify(data), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}