/**
 * api-service.js - Enhanced API Service
 * Handles all API calls with robust error handling and caching
 */

class APIService {
  constructor(config) {
    this.config = config;
    this.cache = new Map();
    this.cacheExpiry = config.app?.cacheDuration || 5 * 60 * 1000;
    this.requestQueue = new Map(); // Prevent duplicate simultaneous requests
  }

  /* ========== HELPER METHODS ========== */

  /**
   * Build URL for API requests (proxy or direct)
   */
  _buildUrl(service, params = {}) {
    // Production: Use Vercel proxy
    if (this.config.proxyUrl) {
      const queryParams = new URLSearchParams({ service, ...params });
      return `${this.config.proxyUrl}?${queryParams}`;
    }

    // Development: Direct API calls
    const serviceConfig = this.config[service];
    if (!serviceConfig) {
      throw new Error(`Unknown service: ${service}`);
    }

    const url = new URL(serviceConfig.baseUrl);
    
    // Add endpoint for NewsAPI
    if (service === 'newsApi') {
      url.pathname += params.category ? '/v2/top-headlines' : '/v2/everything';
    }

    // Add parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    });

    // Add API key for direct calls
    if (service === 'newsApi') url.searchParams.set('apiKey', serviceConfig.key);
    if (service === 'unsplash') url.searchParams.set('client_id', serviceConfig.key);
    if (service === 'youtube') url.searchParams.set('key', serviceConfig.key);

    return url.toString();
  }

  /**
   * Check if cached data is still valid
   */
  _isCacheValid(key) {
    if (!this.cache.has(key)) return false;
    const cached = this.cache.get(key);
    return Date.now() - cached.timestamp < this.cacheExpiry;
  }

  /**
   * Get from cache or return null
   */
  _getFromCache(key) {
    if (this._isCacheValid(key)) {
      console.log(`📦 Cache hit: ${key}`);
      return this.cache.get(key).data;
    }
    return null;
  }

  /**
   * Store in cache
   */
  _setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Fetch with timeout and error handling
   */
  async _fetchWithTimeout(url, options = {}) {
    const timeout = this.config.app?.apiTimeout || 10000;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  /**
   * Deduplicate simultaneous requests
   */
  async _dededuplicatedFetch(key, fetchFn) {
    // If request is already in progress, wait for it
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key);
    }

    // Start new request
    const promise = fetchFn().finally(() => {
      this.requestQueue.delete(key);
    });

    this.requestQueue.set(key, promise);
    return promise;
  }

  /* ========== NEWS API METHODS ========== */

  /**
   * Get top headlines
   */
  async getTopHeadlines(category = 'business', count = 10) {
    const cacheKey = `headlines-${category}-${count}`;
    
    // Check cache first
    const cached = this._getFromCache(cacheKey);
    if (cached) return cached;

    // Fetch from API
    return this._dededuplicatedFetch(cacheKey, async () => {
      try {
        const url = this._buildUrl('newsApi', { 
          category, 
          pageSize: count,
          language: 'en'
        });
        
        const data = await this._fetchWithTimeout(url);
        
        if (data?.articles) {
          this._setCache(cacheKey, data.articles);
          console.log(`✓ Fetched ${data.articles.length} headlines`);
          return data.articles;
        }

        throw new Error('Invalid response from News API');
      } catch (error) {
        console.error('Headlines fetch error:', error);
        return this._getFallbackArticles();
      }
    });
  }

  /**
   * Search articles by query
   */
  async searchArticles(query, pageSize = 20, page = 1) {
    const cacheKey = `search-${query}-${pageSize}-${page}`;
    
    // Check cache
    const cached = this._getFromCache(cacheKey);
    if (cached) return cached;

    // Fetch from API
    return this._dededuplicatedFetch(cacheKey, async () => {
      try {
        const url = this._buildUrl('newsApi', { 
          q: query,
          pageSize,
          page,
          sortBy: 'publishedAt',
          language: 'en'
        });
        
        const data = await this._fetchWithTimeout(url);
        
        if (data?.articles) {
          const result = {
            articles: data.articles,
            totalResults: data.totalResults || 0
          };
          this._setCache(cacheKey, result);
          console.log(`✓ Found ${result.articles.length} articles for "${query}"`);
          return result;
        }

        throw new Error('Invalid search response');
      } catch (error) {
        console.error('Search error:', error);
        return { articles: this._getFallbackArticles(), totalResults: 0 };
      }
    });
  }

  /**
   * Get articles by source
   */
  async getArticlesBySource(source, count = 20) {
    const cacheKey = `source-${source}-${count}`;
    
    const cached = this._getFromCache(cacheKey);
    if (cached) return cached;

    return this._dededuplicatedFetch(cacheKey, async () => {
      try {
        const url = this._buildUrl('newsApi', { 
          sources: source,
          pageSize: count
        });
        
        const data = await this._fetchWithTimeout(url);
        
        if (data?.articles) {
          this._setCache(cacheKey, data.articles);
          return data.articles;
        }

        throw new Error('Invalid source response');
      } catch (error) {
        console.error('Source fetch error:', error);
        return [];
      }
    });
  }

  /* ========== UNSPLASH METHODS ========== */

  /**
   * Get image for query (faster random method)
   */
  async getRandomImage(query) {
    const cacheKey = `img-random-${query}`;
    
    const cached = this._getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Use Unsplash source.unsplash.com for quick random images
      const fallbackUrl = `https://source.unsplash.com/800x450/?${encodeURIComponent(query)}`;
      
      // Make HEAD request to get final redirected URL
      const response = await fetch(fallbackUrl, { method: 'HEAD' });
      const imageUrl = response.url || fallbackUrl;
      
      this._setCache(cacheKey, imageUrl);
      return imageUrl;
    } catch (error) {
      console.warn('Random image fetch failed:', error);
      return this._getFallbackImage(query);
    }
  }

  /**
   * Search Unsplash for specific images
   */
  async searchImages(query, count = 1) {
    const cacheKey = `img-search-${query}-${count}`;
    
    const cached = this._getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const url = this._buildUrl('unsplash', {
        query,
        per_page: count,
        orientation: 'landscape'
      });
      
      const data = await this._fetchWithTimeout(url);
      
      if (data?.results?.length) {
        const images = data.results.map(img => ({
          url: img.urls.regular,
          thumb: img.urls.thumb,
          author: img.user.name,
          authorUrl: img.user.links.html
        }));
        
        this._setCache(cacheKey, images);
        return images;
      }

      throw new Error('No images found');
    } catch (error) {
      console.warn('Image search failed:', error);
      return [{ url: this._getFallbackImage(query) }];
    }
  }

  /* ========== YOUTUBE METHODS ========== */

  /**
   * Search YouTube videos
   */
  async searchVideos(query, maxResults = 5) {
    const cacheKey = `videos-${query}-${maxResults}`;
    
    const cached = this._getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const url = this._buildUrl('youtube', {
        q: query,
        part: 'snippet',
        type: 'video',
        maxResults,
        relevanceLanguage: 'en'
      });
      
      const data = await this._fetchWithTimeout(url);
      
      if (data?.items) {
        const videos = data.items.map(video => ({
          id: video.id.videoId,
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnail: video.snippet.thumbnails.medium.url,
          channelTitle: video.snippet.channelTitle,
          publishedAt: video.snippet.publishedAt
        }));
        
        this._setCache(cacheKey, videos);
        console.log(`✓ Found ${videos.length} videos for "${query}"`);
        return videos;
      }

      throw new Error('No videos found');
    } catch (error) {
      console.error('Video search error:', error);
      return [];
    }
  }

  /* ========== UTILITY METHODS ========== */

  /**
   * Enrich article with image and optional video
   */
  async getEnrichedArticle(article, includeVideo = false) {
    try {
      // Extract topic from title
      const topic = this.extractMainTopic(article.title);
      
      // Get image (use article image if available, otherwise fetch)
      let imageUrl = article.urlToImage;
      if (!imageUrl || !this._isValidImageUrl(imageUrl)) {
        imageUrl = await this.getRandomImage(topic);
      }
      
      // Build enriched article
      const enriched = {
        ...article,
        image: imageUrl,
        topic,
        id: this._generateArticleId(article)
      };

      // Add video if requested
      if (includeVideo) {
        const videos = await this.searchVideos(topic, 1);
        if (videos.length > 0) {
          enriched.video = videos[0];
          enriched.videoId = videos[0].id;
        }
      }

      return enriched;
    } catch (error) {
      console.error('Article enrichment error:', error);
      return { ...article, image: this._getFallbackImage('finance') };
    }
  }

  /**
   * Extract main topic from article title
   */
  extractMainTopic(title) {
    if (!title) return 'finance';
    
    // Remove common stop words
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 
                       'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was'];
    
    const words = title
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(' ')
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .slice(0, 3);
    
    return words.length > 0 ? words.join(' ') : 'finance';
  }

  /**
   * Validate image URL
   */
  _isValidImageUrl(url) {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Generate unique article ID
   */
  _generateArticleId(article) {
    try {
      return btoa(article.url || article.title)
        .slice(0, 16)
        .replace(/[/+=]/g, match => {
          return { '/': '-', '+': '_', '=': '' }[match];
        });
    } catch {
      return 'article_' + Date.now();
    }
  }

  /**
   * Get fallback image URL
   */
  _getFallbackImage(query = 'finance') {
    const fallbackImages = {
      finance: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
      market: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800',
      stock: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
      business: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'
    };
    
    const key = Object.keys(fallbackImages).find(k => query.toLowerCase().includes(k));
    return fallbackImages[key] || fallbackImages.finance;
  }

  /**
   * Get fallback articles when API fails
   */
  _getFallbackArticles() {
    return [
      {
        title: "Market Update: Stocks Hold Steady Amid Economic Uncertainty",
        description: "Financial markets showed resilience today as investors digest latest economic data.",
        author: "Financial Frontier Staff",
        source: { name: "The Financial Frontier" },
        publishedAt: new Date().toISOString(),
        url: "#",
        urlToImage: this._getFallbackImage('market')
      },
      {
        title: "Federal Reserve Signals Cautious Approach to Interest Rates",
        description: "Central bank officials indicate patience as they monitor inflation trends.",
        author: "Financial Frontier Staff",
        source: { name: "The Financial Frontier" },
        publishedAt: new Date().toISOString(),
        url: "#",
        urlToImage: this._getFallbackImage('finance')
      },
      {
        title: "Tech Sector Shows Strong Growth Despite Volatility",
        description: "Leading technology companies report better than expected earnings.",
        author: "Financial Frontier Staff",
        source: { name: "The Financial Frontier" },
        publishedAt: new Date().toISOString(),
        url: "#",
        urlToImage: this._getFallbackImage('technology')
      }
    ];
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️  API cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APIService;
}