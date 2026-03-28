# Football Highlights MVP

Mobile-first, spoiler-safe football highlights app built with React + TypeScript + Vite + Tailwind.

## Features

- Blind Mode (anti-spoiler) toggle with persistent state
- League filters and curated sections (Morning, Favorites, Frequently Watched)
- Real fixtures/results from football-data.org
- Trusted official source list on match detail (expand to reveal highlight link)
- Blind Mode safe source-first UI (no spoiler title/thumbnail/embed in initial view)
- Language-aware highlight search (`ja` / `en`) with query expansion and channel reranking
- Candidate scoring by partial team-name match, highlight keywords, recency, trusted channel boost, and negative-term filtering
- Up to 3 practical non-Shorts candidates returned for finished matches (Shorts excluded)
- YouTube search/channel fallback always available via trusted source cards
- Settings for default Blind Mode, app language, favorite clubs, and reset personalization

## Environment variables

Create a `.env` file for local development (used by the API server):

```bash
FOOTBALL_DATA_API_KEY=your_football_data_api_key
YOUTUBE_API_KEY=your_youtube_api_key
API_PORT=8787
```

Required keys:

- `FOOTBALL_DATA_API_KEY`
- `YOUTUBE_API_KEY`

## Main files

- `api-server.mjs` minimal server-side layer for football-data + YouTube retrieval/scoring/reranking
- `src/pages/MatchDetailPage.tsx` spoiler-safe detail flow + source-first expand behavior
- `src/hooks/useLanguage.ts` app-level language state (`ja` / `en`) persisted to localStorage
- `src/utils/api.ts` client API utility for `/api/*` endpoints
- `src/hooks/useMatches.ts` client hook for loading real matches

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start API server:
   ```bash
   npm run dev:api
   ```
3. In another terminal, start Vite app:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## Project structure

- `src/components` reusable UI components
- `src/pages` route-level pages
- `src/hooks` app state hooks with localStorage persistence
- `src/data` UI constants (e.g., leagues)
- `src/utils` API/storage/date helpers
