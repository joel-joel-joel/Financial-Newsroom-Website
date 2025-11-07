/**
 * api-service.js
 * Centralized module for all API calls
 * Handles: NewsAPI, Unsplash, YouTube
 * Features: Caching, error handling, fallbacks
 */

class APIService {
  constructor(config) {
    this.config = config;
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

    /* ==========  PROXY / DIRECT HELPER  ========== */
  _buildUrl(service, params = {}) {
    if (this.config.proxyUrl) {
      const q = new URLSearchParams({ service, ...params });
      return `${this.config.proxyUrl}?${q}`;
    }
    // legacy direct call
    const cfg = this.config[service]; // 'newsApi' | 'unsplash' | 'youtube'
    const u = new URL(cfg.baseUrl + (service === 'newsApi' ? '/v2/everything' : ''));
    Object.keys(params).forEach(k => u.searchParams.set(k, params[k]));
    u.searchParams.set('apiKey', cfg.key);
    return u.toString();
  }

  /**
   * Helper: Check if cached data is still valid
   */
  isCacheValid(key) {
    if (!this.cache.has(key)) return false;
    const cached = this.cache.get(key);
    return Date.now() - cached.timestamp < this.cacheExpiry;
  }

  /**
   * Helper: Fetch with error handling
   */
  async fetchWithErrorHandling(url, errorMessage) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      return null;
    }
  }

  // ==================== NewsAPI Methods ====================

  /**
   * Fetch top headlines for news ticker
   * @param {string} category - News category (e.g., 'business', 'technology')
   * @param {number} count - Number of articles to fetch
   * @returns {Promise<Array>} Array of headline objects
   */
  async getTopHeadlines(category = 'business', count = 10) {
    const cacheKey = `headlines-${category}`;
    
    // Return cached data if valid
    if (this.isCacheValid(cacheKey)) {
      console.log('Returning cached headlines');
      return this.cache.get(cacheKey).data;
    }

    const url = this._buildUrl('newsApi', { category, pageSize: count });
    url.searchParams.append('category', category);
    url.searchParams.append('pageSize', count);
    url.searchParams.append('apiKey', this.config.newsApi.key);

    const data = await this.fetchWithErrorHandling(
      url.toString(),
      'Failed to fetch headlines'
    );

    if (data && data.articles) {
      // Cache the results
      this.cache.set(cacheKey, {
        data: data.articles,
        timestamp: Date.now()
      });
      return data.articles;
    }

    return [];
  }

  /**
   * Fetch articles by keyword/topic
   * @param {string} query - Search query
   * @param {number} pageSize - Results per page
   * @param {number} page - Page number for pagination
   * @returns {Promise<Object>} Articles data with pagination info
   */
  async searchArticles(query, pageSize = 20, page = 1) {
    const cacheKey = `search-${query}-${page}`;
    
    if (this.isCacheValid(cacheKey)) {
      console.log('Returning cached search results');
      return this.cache.get(cacheKey).data;
    }

    const url = this._buildUrl('newsApi', { q: query, pageSize, page, sortBy: 'publishedAt' });    url.searchParams.append('q', query);
    url.searchParams.append('pageSize', pageSize);
    url.searchParams.append('page', page);
    url.searchParams.append('sortBy', 'publishedAt');
    url.searchParams.append('apiKey', this.config.newsApi.key);

    const data = await this.fetchWithErrorHandling(
      url.toString(),
      `Failed to search articles for "${query}"`
    );

    if (data && data.articles) {
      this.cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });
      return data;
    }

    return { articles: [], totalResults: 0 };
  }

  /**
   * Fetch articles by source
   * @param {string} source - News source ID
   * @returns {Promise<Array>} Articles from specified source
   */
  async getArticlesBySource(source) {
    const cacheKey = `source-${source}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    const url = this._buildUrl('newsApi', { sources: source, pageSize: 20 });
    url.searchParams.append('sources', source);
    url.searchParams.append('pageSize', 20);
    url.searchParams.append('apiKey', this.config.newsApi.key);

    const data = await this.fetchWithErrorHandling(
      url.toString(),
      `Failed to fetch articles from source: ${source}`
    );

    if (data && data.articles) {
      this.cache.set(cacheKey, {
        data: data.articles,
        timestamp: Date.now()
      });
      return data.articles;
    }

    return [];
  }

  // ==================== Unsplash API Methods ====================

  /**
   * Fetch image from Unsplash based on query
   * @param {string} query - Search term (e.g., 'stock market', 'crypto')
   * @param {number} page - Page number for pagination
   * @returns {Promise<Object>} Image object with URLs
   */
  async getImage(query, page = 1) {
    const cacheKey = `image-${query}-${page}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    const url = this._buildUrl('unsplash', { query, page, per_page: 1, orientation: 'landscape' });
    url.searchParams.append('query', query);
    url.searchParams.append('page', page);
    url.searchParams.append('per_page', 1);
    url.searchParams.append('orientation', 'landscape');
    url.searchParams.append('client_id', this.config.unsplash.key);

    const data = await this.fetchWithErrorHandling(
      url.toString(),
      `Failed to fetch image for: ${query}`
    );

    if (data && data.results && data.results.length > 0) {
      const image = data.results[0];
      this.cache.set(cacheKey, {
        data: image,
        timestamp: Date.now()
      });
      return image;
    }

    return null;
  }

  /**
   * Get random image from Unsplash (no API key needed for free tier)
   * @param {string} query - Search term
   * @returns {Promise<string>} Image URL
   */
  async getRandomImage(query) {
    const cacheKey = `random-image-${query}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    // Using Unsplash's simple random image endpoint (no key required)
    const url = `https://source.unsplash.com/800x450/?${query}`;
    
    // This returns a redirect, so we just cache and return the URL
    this.cache.set(cacheKey, {
      data: url,
      timestamp: Date.now()
    });

    return url;
  }

  // ==================== YouTube API Methods ====================

  /**
   * Search YouTube for financial videos
   * @param {string} query - Search term
   * @param {number} maxResults - Max results to return
   * @returns {Promise<Array>} Array of video objects
   */
  async searchVideos(query, maxResults = 5) {
    const cacheKey = `videos-${query}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    const url = this._buildUrl('youtube', { q: query, part: 'snippet', type: 'video', maxResults });
    url.searchParams.append('q', query);
    url.searchParams.append('part', 'snippet');
    url.searchParams.append('type', 'video');
    url.searchParams.append('maxResults', maxResults);
    url.searchParams.append('relevanceLanguage', 'en');
    url.searchParams.append('key', this.config.youtube.key);

    const data = await this.fetchWithErrorHandling(
      url.toString(),
      `Failed to fetch videos for: ${query}`
    );

    if (data && data.items) {
      this.cache.set(cacheKey, {
        data: data.items,
        timestamp: Date.now()
      });
      return data.items;
    }

    return [];
  }

  /**
   * Get video details including view count
   * @param {string} videoId - YouTube video ID
   * @returns {Promise<Object>} Video details
   */
  async getVideoDetails(videoId) {
    const url = new URL(`${this.config.youtube.baseUrl}/videos`);
    url.searchParams.append('id', videoId);
    url.searchParams.append('part', 'snippet,statistics');
    url.searchParams.append('key', this.config.youtube.key);

    return await this.fetchWithErrorHandling(
      url.toString(),
      `Failed to fetch video details: ${videoId}`
    );
  }

  // ==================== Data Aggregation Methods ====================

  /**
   * Get complete article with image and optional video
   * Combines data from multiple APIs into single object
   * @param {Object} article - NewsAPI article object
   * @param {boolean} includeVideo - Whether to fetch related video
   * @returns {Promise<Object>} Enhanced article object
   */
  async getEnrichedArticle(article, includeVideo = false) {
    let img = article.urlToImage;
    if (!img || img.includes('placeholder')) {
    const unsplash = await this.getRandomImage(topic);
    img = unsplash?.urls?.regular || unsplash; // random endpoint returns string
    }


    try {
      // Extract topic from article title for image search
      const topic = this.extractMainTopic(article.title);

      // Fetch image
      const image = await this.getRandomImage(topic);

      // Build enriched article object
      const enriched = {
        ...article,
        image: image || article.urlToImage,
        topic: topic
      };

      // Optionally fetch related video
      if (includeVideo) {
        const videos = await this.searchVideos(topic, 1);
        if (videos.length > 0) {
          enriched.video = videos[0];
          enriched.videoId = videos[0].id.videoId;
        }
      }

      return enriched;
    } catch (error) {
      console.error('Error enriching article:', error);
      return article; // Return original article if enrichment fails
    }
    
  }

  /**
   * Extract main topic from article title
   * Used for image and video search queries
   * @param {string} title - Article title
   * @returns {string} Main topic
   */
  extractMainTopic(title) {
    // Remove common words and get first 3-4 significant words
    const words = title
      .split(' ')
      .filter(word => word.length > 3 && !['about', 'after', 'stock', 'market'].includes(word.toLowerCase()))
      .slice(0, 3)
      .join(' ');

    return words || 'finance'; // Fallback to 'finance'
  }

  /**
   * Clear cache (useful for testing or forcing refresh)
   */
  clearCache() {
    this.cache.clear();
    console.log('API cache cleared');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APIService;
}