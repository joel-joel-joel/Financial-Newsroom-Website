/**
 * config.js - API Configuration
 * IMPORTANT: Replace YOUR_VERCEL_URL with your actual deployment URL
 * For production, move API keys to environment variables
 */

const API_CONFIG = (() => {
  // Detect environment
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
  
  // Production configuration (uses Vercel proxy)
  const production = {
    proxyUrl: 'https://financial-newsroom-website.vercel.app/api', // REPLACE THIS!
    app: {
      cacheDuration: 5 * 60 * 1000, // 5 minutes
      articlesPerPage: 20,
      fallbackDataPath: './json/fallback-articles.json',
      enableLogging: true,
      imageRetryAttempts: 3,
      apiTimeout: 10000 // 10 seconds
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
  
  if (!window.location.hostname.includes('localhost') && 
      API_CONFIG.proxyUrl?.includes('financial-newsroom-website.vercel.app')) {
    console.warn('⚠️ Warning: Update proxyUrl in config.js with your actual Vercel URL');
  }
  
  console.log('✓ API Config loaded:', 
    API_CONFIG.proxyUrl ? 'Production (Proxy)' : 'Development (Direct)');
})();