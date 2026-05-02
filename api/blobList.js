import { list } from '@vercel/blob';

export default async function handler(req, res) {
  const blobs = await list({ prefix: 'highlights/' });
  return res.status(200).json(blobs.blobs.map(b => ({
    pathname: b.pathname,
    url: b.url
  })));
}