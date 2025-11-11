/*
 * For production deployment on Vercel
 */

const API_CONFIG = (() => {
  // Detect environment
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
  
  // Production configuration (uses Vercel proxy)
  const production = {
    // Use relative path for same-origin API calls on Vercel
    proxyUrl: '/api',
    app: {
      cacheDuration: 5 * 60 * 1000, // 5 minutes
      articlesPerPage: 20,
      fallbackDataPath: './json/fallback-articles.json',
      enableLogging: true,
      imageRetryAttempts: 3,
      apiTimeout: 15000 // 15 seconds for API calls
    }
  };

  // Development configuration (direct API calls)
  const development = {
    newsApi: {
      key: '6c78148a30b049718defe0e8cdde97f7',
      baseUrl: 'https://newsapi.org/v2',
      category: 'business',
      pageSize: 20
    },
    unsplash: {
      key: 'CYba8ZHeC66hwyANph4Zn8l6jzvcVUZsP9zbFy8g238',
      baseUrl: 'https://api.unsplash.com',
      fallbackUrl: 'https://source.unsplash.com'
    },
    youtube: {
      key: 'AIzaSyD7_hcYEEuFnewhqmeg-UNT5PXPxUV9FMw',
      baseUrl: 'https://www.googleapis.com/youtube/v3'
    },
    app: production.app
  };

  // Return appropriate config
  return isLocalhost ? development : production;
})();

// Validate configuration on load
(function validateConfig() {
  if (!API_CONFIG.proxyUrl && !API_CONFIG.newsApi) {
    console.error('❌ API Configuration Error: No valid API endpoint found');
  }
  
  const configType = API_CONFIG.proxyUrl ? 'Production (Proxy)' : 'Development (Direct)';
  console.log('✅ API Config loaded:', configType);
  
  if (API_CONFIG.proxyUrl) {
    console.log('📡 API Endpoint:', API_CONFIG.proxyUrl);
  }
})();