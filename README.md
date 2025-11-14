# Financial Newsroom - The Financial Frontier

## Overview
A production-ready, API-driven financial news aggregator demonstrating modular JavaScript architecture, serverless deployment patterns, and resilient frontend systems. Built with vanilla ES2020+ to showcase enterprise-grade patterns without framework overhead.

**Live Demo:** [https://financial-newsroom-website.vercel.app](https://financial-newsroom-website.vercel.app)

## Why I Made This
Having gotten a pretty basic overview of HTML/CSS/JS, this was my crude attempt at applying my knowledge and trying my hand at API implementation for the first time. I also really wanted to create something that tailored to what I might actually use; a financial news site that could be useful alongside a portfolio tracker. Ultimately, I hope this website can work in a network with some of the projects I will be making.

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Vanilla ES2020+ | Modular, no-framework architecture |
| Styling | Custom CSS (BEM-ish) | Scoped component styling |
| APIs | NewsAPI, YouTube Data API, Google Gemini AI | Real-time news & video content |
| Backend | Vercel Serverless Functions | CORS proxy & API key security |
| Deployment | Vercel | Edge caching, instant rollbacks |
| Caching | In-memory LRU (5min TTL) | Rate limit mitigation |
| Images | Unsplash Source API | Fallback image orchestration |

## Key Features & Implementation Details

### 1. Intelligent API Orchestration
- **Request Deduplication:** Prevents duplicate simultaneous calls via `_deduplicatedFetch()`
- **Graceful Degradation:** Falls back to static content if API fails
- **Rate Limit Management:** 5-minute in-memory caching reduces calls by ~80%
- **Query Optimization:** Region-specific search strings maximize free-tier usage

```javascript
// Example: Adaptive query building for max relevance
const regionQueries = {
    australia: 'Australia Sydney Melbourne ASX market finance economy',
    africa: 'Africa Kenya Nigeria "South Africa" market finance',
    // ... optimized for NewsAPI's relevance scoring
}
```

### 2. Resilient DOM Rendering
- **Element Verification:** Every render checks for element existence before injection
- **Style-Aware Mapping:** Grid 2 uses inverted layout mapping (Sub-2 → Main → Sub-1)
- **Error Boundaries:** Each section loads independently; one failure doesn't crash the page

### 3. Serverless CORS Proxy
- **Security:** API keys never exposed to client (only in Vercel env vars)
- **Flexibility:** Single endpoint handles all region queries
- **Caching:** Vercel edge caching reduces NewsAPI calls

```javascript
// api/regional-news.cjs
module.exports = async (req, res) => {
  // CORS headers, validation, then proxy to NewsAPI
  // ... full validation & error handling
}
```

### 4. Service-Renderer-Loader Architecture
A custom framework-agnostic pattern that mirrors modern component architecture:
- **Config Layer:** Environment detection and API key management
- **Service Layer:** `APIService` handles all API calls with deduplication, caching, and retry logic
- **Renderer Layer:** `UIRenderer` abstracts DOM manipulation and content injection
- **Loader Layer:** Page-specific orchestrators coordinate data flow

## Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/financial-newsroom.git
cd financial-newsroom
```

### 2. Install Vercel CLI
```bash
npm i -g vercel
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory:
```bash
NEWS_KEY=your_newsapi_key
GEMINI_KEY=your_gemini_key
UNSPLASH_KEY=your_unsplash_key
YOUTUBE_KEY=your_youtube_key
```

### 4. Run Local Development Server
```bash
vercel dev
```
App runs at http://localhost:3000 with full API functionality.

## Deployment

### Production Deployment
```bash
# Push to GitHub (Vercel auto-deploys)
git add . && git commit -m "feat: add region caching" && git push origin main
```

Required Environment Variables (set in Vercel dashboard):
- `NEWS_KEY`
- `GEMINI_KEY`
- `UNSPLASH_KEY`
- `YOUTUBE_KEY`

## Page Structure

### Regional Pages (`australia.html`, `africa.html`, etc.)
- **File:** `regional-loader.js`
- **Pattern:** Standard main + 2 sub-stories + 8 additional articles
- **Specialization:** Single-region queries with enriched metadata

### World Page (`world.html`)
- **File:** `world-loader.js`
- **Pattern:** Dual-grid layout with intentional style variation
- **Orchestration:** 6 separate API calls (top stories, 4 regions, trending) parallelized with `Promise.all`

## Future Enhancements
- Service Worker for offline-first caching strategy
- WebSocket integration for real-time ticker updates
- Image optimization with next-gen format negotiation (AVIF/WebP)
- A/B testing framework for layout variants
- Analytics pipeline (Google Analytics 4 + custom event tracking)

## Contact
**Email:** leojongenli@gmail.com  
**LinkedIn:** [linkedin.com/in/joel-ong-2b82a3362](https://www.linkedin.com/in/joel-ong-2b82a3362/)
