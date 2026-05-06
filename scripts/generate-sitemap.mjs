import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://footyam-v1.vercel.app';

const publicDir = path.resolve('public');
const sitemapPath = path.resolve('public/sitemap.xml');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

const urls = [
  `${SITE_URL}/`,
];

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

console.log(`✅ sitemap generated`);