import { list } from '@vercel/blob';

export default async function handler(req, res) {
  const blobs = await list({ prefix: 'highlight-state.json' });

  if (!blobs.blobs.length) {
    return res.status(200).json({ found: false, state: {} });
  }

  const response = await fetch(blobs.blobs[0].url);
  const state = await response.json();

  return res.status(200).json({
    found: true,
    matchIds: Object.keys(state),
    state,
  });
}