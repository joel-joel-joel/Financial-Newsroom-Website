// config.js  ––  works for localhost dev + production proxy
const API_CONFIG = (() => {
  const prod = {
    proxyUrl: 'https://financial-newsroom-website.vercel.app/api', // << deploy your own
    app: {
      cacheDuration: 5 * 60 * 1000,
      articlesPerPage: 20,
      fallbackDataPath: './json/fallback-articles.json',
      enableLogging: true
    }
  };
  const dev = {
    newsApi: {
      key: '6c78148a30b049718defe0e8cdde97f7',
      baseUrl: 'https://newsapi.org/v2',
      category: 'business',
      pageSize: 20
    },
    unsplash: {
      key: 'CYba8ZHeC66hwyANph4Zn8l6jzvcVUZsP9zbFy8g238',
      baseUrl: 'https://api.unsplash.com'
    },
    youtube: {
      key: 'AIzaSyD7_hcYEEuFnewhqmeg-UNT5PXPxUV9FMw',
      baseUrl: 'https://www.googleapis.com/youtube/v3'
    },
    app: prod.app
  };
  return (window.location.hostname === 'localhost') ? dev : prod;
})();


proxyUrl: window.location.hostname === 'localhost'
          ? 'http://localhost:3000/api'
          : 'https://your-real-vercel.app/api'