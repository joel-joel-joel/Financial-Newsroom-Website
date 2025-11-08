/**
 * api-service.js
 * Centralised module for all API calls
 * Works via Vercel proxy OR direct (localhost)
 * Features: in-memory cache, error fall-backs
 */

class APIService {
  constructor(config) {
    this.config = config;
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 min
  }

  /* ----------  helpers  ---------- */
  _buildUrl(service, params = {}) {
    if (this.config.proxyUrl) {                 // production – vercel proxy
      const q = new URLSearchParams({ service, ...params });
      return `${this.config.proxyUrl}?${q}`;
    }
    // localhost – direct call
    const cfg = this.config[service];           // 'newsApi' | 'unsplash' | 'youtube'
    const u = new URL(cfg.baseUrl + (service === 'newsApi' && !params.category ? '/v2/everything' : ''));
    Object.keys(params).forEach(k => u.searchParams.set(k, params[k]));
    u.searchParams.set('apiKey', cfg.key);
    return u.toString();
  }

  isCacheValid(key) {
    if (!this.cache.has(key)) return false;
    return Date.now() - this.cache.get(key).timestamp < this.cacheExpiry;
  }

  async fetchWithErrorHandling(url, errorMsg) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      return await r.json();
    } catch (e) {
      console.error(`${errorMsg}:`, e);
      return null;
    }
  }

  /* ----------  NewsAPI  ---------- */
  async getTopHeadlines(category = 'business', count = 10) {
    const key = `headlines-${category}`;
    if (this.isCacheValid(key)) return this.cache.get(key).data;

    const url = this._buildUrl('newsApi', { category, pageSize: count });
    const data = await this.fetchWithErrorHandling(url, 'headlines fetch');
    if (data?.articles) {
      this.cache.set(key, { data: data.articles, timestamp: Date.now() });
      return data.articles;
    }
    return [];
  }

  async searchArticles(query, pageSize = 20, page = 1) {
    const key = `search-${query}-${page}`;
    if (this.isCacheValid(key)) return this.cache.get(key).data;

    const url = this._buildUrl('newsApi', { q: query, pageSize, page, sortBy: 'publishedAt' });
    const data = await this.fetchWithErrorHandling(url, 'search fetch');
    if (data?.articles) {
      this.cache.set(key, { data, timestamp: Date.now() });
      return data;
    }
    return { articles: [], totalResults: 0 };
  }

  async getArticlesBySource(source) {
    const key = `source-${source}`;
    if (this.isCacheValid(key)) return this.cache.get(key).data;

    const url = this._buildUrl('newsApi', { sources: source, pageSize: 20 });
    const data = await this.fetchWithErrorHandling(url, 'source fetch');
    if (data?.articles) {
      this.cache.set(key, { data: data.articles, timestamp: Date.now() });
      return data.articles;
    }
    return [];
  }

  /* ----------  Unsplash  ---------- */
  async getImage(query, page = 1) {
    const key = `image-${query}-${page}`;
    if (this.isCacheValid(key)) return this.cache.get(key).data;

    const url = this._buildUrl('unsplash', { query, page, per_page: 1, orientation: 'landscape' });
    const data = await this.fetchWithErrorHandling(url, 'Unsplash fetch');
    if (data?.results?.length) {
      this.cache.set(key, { data: data.results[0], timestamp: Date.now() });
      return data.results[0];
    }
    return null;
  }

  async getRandomImage(query) {
  const key = `random-${query}`;
  if (this.isCacheValid(key)) return this.cache.get(key).data;

  // hit redirect endpoint with fetch + no-cors to grab final URL
  const redirectUrl = `https://source.unsplash.com/800x450/?${encodeURIComponent(query)}`;
  const r = await fetch(redirectUrl, { method: 'HEAD' }); // HEAD = lighter
  const finalUrl = r.url || redirectUrl; // r.url is the resolved JPG

  this.cache.set(key, { data: finalUrl, timestamp: Date.now() });
  return finalUrl;
}

  /* ----------  YouTube  ---------- */
  async searchVideos(query, maxResults = 5) {
    const key = `videos-${query}`;
    if (this.isCacheValid(key)) return this.cache.get(key).data;

    const url = this._buildUrl('youtube', { q: query, part: 'snippet', type: 'video', maxResults });
    const data = await this.fetchWithErrorHandling(url, 'YouTube fetch');
    if (data?.items) {
      this.cache.set(key, { data: data.items, timestamp: Date.now() });
      return data.items;
    }
    return [];
  }

  /* ----------  aggregator  ---------- */
  async getEnrichedArticle(article, includeVideo = false) {
    try {
      const topic = this.extractMainTopic(article.title);
      const image = await this.getRandomImage(topic); // fast, no key

      const enriched = { ...article, image: image || article.urlToImage, topic };

      if (includeVideo) {
        const videos = await this.searchVideos(topic, 1);
        if (videos.length) {
          enriched.video = videos[0];
          enriched.videoId = videos[0].id.videoId;
        }
      }
      return enriched;
    } catch (e) {
      console.error('enrich error:', e);
      return article; // fallback
    }
  }

  extractMainTopic(title) {
    return title
      .split(' ')
      .filter(w => w.length > 3 && !['about', 'after', 'stock', 'market'].includes(w.toLowerCase()))
      .slice(0, 3)
      .join(' ') || 'finance';
  }

  clearCache() {
    this.cache.clear();
    console.log('API cache cleared');
  }
}

// Node / ES-module friendly
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APIService;
}