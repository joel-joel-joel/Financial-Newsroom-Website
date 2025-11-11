# Financial Newsroom - The Financial Frontier

A production-ready, API-driven financial news aggregator demonstrating modular JavaScript architecture, serverless deployment patterns, and resilient frontend systems.

---

## 📄 Why I made this
Having gotten a pretty basic overview of HTML/CSS/JS, this was my crude attept at applying my knowledge and trying my hand at API implementation for the first time. I also really wanted to create something that tailored to what I might actually use; a financial news site that could be useful alongside a portfolio tracker. Ultimately, I hope this website can work in a network with some of the projects I will be making.

## 🎯 Project Overview

A multi-region financial news platform that ingests real-time content from NewsAPI, orchestrates data through Vercel serverless functions, and renders a responsive newsroom interface with regional specialization. Built to showcase enterprise-grade JavaScript patterns without framework overhead.

**Live Demo:** [https://financial-newsroom-website.vercel.app](https://financial-newsroom-website.vercel.app)

---

## 🏗️ Architecture & Technical Decisions

### Core Architecture Pattern
**Service-Renderer-Loader Separation** - A custom framework-agnostic pattern that mirrors modern component architecture:
- **Config Layer:** Environment detection and API key management
- **Service Layer:** `APIService` handles all API calls with deduplication, caching, and retry logic
- **Renderer Layer:** `UIRenderer` abstracts DOM manipulation and content injection
- **Loader Layer:** Page-specific orchestrators (`regional-loader.js`, `world-loader.js`) coordinate data flow

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Vanilla ES2020+ | Modular, no-framework architecture |
| Styling | Custom CSS (BEM-ish) | Scoped component styling |
| APIs | NewsAPI, YouTube Data API, Google Gemini Generative AI API | Real-time news & video content |
| Backend | Vercel Serverless Functions (Node.js) | CORS proxy & API key security |
| Deployment | Vercel | Edge caching, instant rollbacks |
| Caching | In-memory LRU (5min TTL) | Rate limit mitigation |
| Images | Unsplash Source API | Fallback image orchestration |

---

## 📁 Project Structure
├── api/
│   └── regional-news.cjs          # Vercel serverless function (CORS proxy)
├── css/
│   ├── australia.css
│   └── world.css
├── js/
│   ├── config.js                  # Environment configuration
│   ├── api-service.js             # API abstraction & caching layer
│   ├── ui-renderer.js             # DOM manipulation & rendering
│   ├── regional-loader.js         # Australia/Africa/Asia/Europe pages
│   └── world-loader.js            # World page orchestrator
├── *.html                         # Static entry points
└── README.md

---

## ⚡ Key Features & Implementation Details

### 1. **Intelligent API Orchestration**
- **Request Deduplication:** `_deduplicatedFetch()` prevents duplicate simultaneous calls
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
Element Verification: Every render checks for element existence before injection
Style-Aware Mapping: Grid 2 uses inverted layout mapping (Sub-2 → Main → Sub-1)
Error Boundaries: Each section loads independently; one failure doesn't crash the page

### 3. Serverless CORS Proxy
Security: API keys never exposed to client (only in Vercel env vars)
Flexibility: Single endpoint handles all region queries
Caching: Vercel edge caching reduces NewsAPI calls

```javascript
// api/regional-news.cjs
module.exports = async (req, res) => {
  // CORS headers, validation, then proxy to NewsAPI
  // ... full validation & error handling
}
```

## 🚀 Setup & Deployment
Local Development (with Vercel Functions)
```javascript
# Install Vercel CLI
npm i -g vercel


# Run local dev server (includes API proxy)
vercel dev
```
App runs at http://localhost:3000 with full API functionality.

Production Deployment
``` javascript
# Push to GitHub (Vercel auto-deploys)
git add . && git commit -m "feat: add region caching" && git push origin main
```

Required Environment Variables (set in Vercel dashboard):
- NEWS_KEY=your_newsapi_key
- GEMINI_KEY=your_gemini_key
- UNSPLASH_KEY=your_unsplash_key
- YOUTUBE_KEY=your_youtube_key

---

## 🎨 Page-Specific Loaders

### Regional Pages (`australia.html`, `africa.html`, etc.)
- **File:** `regional-loader.js`
- **Pattern:** Standard main + 2 sub-stories + 8 additional articles
- **Specialization:** Single-region queries with enriched metadata

### World Page (`world.html`)
- **File:** `world-loader.js`
- **Pattern:** Dual-grid layout with intentional style variation
- **Orchestration:** 6 separate API calls (top stories, 4 regions, trending) parallelized with `Promise.all`

---

## 🔮 Future Improvements (Roadmap)

- **Service Worker:** Offline-first caching strategy
- **WebSocket Integration:** Real-time ticker updates
- **Image Optimization:** Next-gen format negotiation (AVIF/WebP)
- **A/B Testing Framework:** Built-in variant system for layout testing
- **Analytics Pipeline:** Google Analytics 4 + custom event tracking

---

Feel free to fork and adapt for your portfolio.

---

**Contact:** leojongenli@gmail.com
**LinkedIn:** https://www.linkedin.com/in/joel-ong-2b82a3362/
