import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://footyam-v1.vercel.app';

const matchesPath = path.resolve('matches.json');
const publicDir = path.resolve('public');
const sitemapPath = path.resolve('public/sitemap.xml');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

const matches = JSON.parse(fs.readFileSync(matchesPath, 'utf-8'));

const staticPages = [
  `${SITE_URL}/`,
  `${SITE_URL}/privacy`,
  `${SITE_URL}/terms`,
  `${SITE_URL}/contact`,
];

const matchPages = matches
  .filter((match) => match.id)
  .map((match) => `${SITE_URL}/match/${match.id}`);

const urls = Array.from(new Set([...staticPages, ...matchPages]));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url}</loc>
  </url>`
  )
  .join('\n')}
</urlset>
`;

fs.writeFileSync(sitemapPath, sitemap);

console.log(`✅ sitemap generated: ${urls.length} URLs`);