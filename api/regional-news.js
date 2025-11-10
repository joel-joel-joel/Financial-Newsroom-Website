// api/regional-news.js - Regional news endpoint with proper error handling
module.exports = async (req, res) => {
  console.log('🎯 Function invoked with region:', req.body?.region);
  console.log('🔑 NEWS_KEY present:', !!process.env.NEWS_KEY);
  // ===== CORS Configuration =====
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed',
      allowedMethods: ['POST']
    });
  }

  // ===== Validate Environment Variables =====
  if (!process.env.NEWS_KEY) {
    console.error('❌ NEWS_KEY environment variable not set');
    return res.status(500).json({ 
      success: false,
      error: 'Server configuration error',
      details: 'API key not configured'
    });
  }

  // ===== Extract and Validate Parameters =====
  const { region, pageSize = 20, page = 1 } = req.body;
  
  const validRegions = ['australia', 'africa', 'americas', 'asia', 'europe'];
  if (!region || !validRegions.includes(region.toLowerCase())) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid region',
      details: `Region must be one of: ${validRegions.join(', ')}`
    });
  }

  // ===== Build Search Query Based on Region =====
  const regionQueries = {
    australia: 'Australia OR Sydney OR Melbourne OR ASX market finance economy',
    africa: 'Africa OR Kenya OR Nigeria OR "South Africa" market finance economy',
    americas: 'Americas OR USA OR Canada OR Brazil OR "Latin America" market finance economy',
    asia: 'Asia OR China OR Japan OR India OR Singapore market finance economy',
    europe: 'Europe OR UK OR Germany OR France OR ECB market finance economy'
  };

  const query = regionQueries[region.toLowerCase()];

  try {
    console.log(`📤 Fetching regional news for: ${region}`);
    
    // ===== Call NewsAPI =====
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const apiUrl = new URL('https://newsapi.org/v2/everything');
    apiUrl.searchParams.set('q', query);
    apiUrl.searchParams.set('pageSize', pageSize);
    apiUrl.searchParams.set('page', page);
    apiUrl.searchParams.set('sortBy', 'publishedAt');
    apiUrl.searchParams.set('language', 'en');
    apiUrl.searchParams.set('apiKey', process.env.NEWS_KEY);

    const response = await fetch(apiUrl.toString(), {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(`📥 NewsAPI response: ${response.status}`);

    const data = await response.json();

    // ===== Handle Error Responses =====
    if (!response.ok) {
      console.error('❌ NewsAPI error:', data);
      
      if (response.status === 429) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          details: 'Too many requests, please try again later'
        });
      }
      
      if (response.status === 401) {
        return res.status(401).json({
          success: false,
          error: 'Authentication error',
          details: 'Invalid API key'
        });
      }

      throw new Error(data.message || `HTTP ${response.status}`);
    }

    // ===== Validate Response Data =====
    if (!data.articles || !Array.isArray(data.articles)) {
      console.error('❌ Invalid response structure:', data);
      return res.status(500).json({ 
        success: false,
        error: 'Invalid response format',
        details: 'NewsAPI returned malformed data'
      });
    }

    console.log(`✅ Retrieved ${data.articles.length} articles for ${region}`);

    // ===== Return Successful Response =====
    return res.status(200).json({ 
      success: true,
      region,
      articles: data.articles,
      totalResults: data.totalResults || 0,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    // ===== Comprehensive Error Handling =====
    console.error('❌ Regional News API Error:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });

    let statusCode = 500;
    let errorMessage = 'Failed to fetch regional news';
    let errorDetails = err.message;

    if (err.name === 'AbortError') {
      statusCode = 504;
      errorMessage = 'Request timeout';
      errorDetails = 'NewsAPI took too long to respond';
    } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
      statusCode = 503;
      errorMessage = 'Service unavailable';
      errorDetails = 'Unable to reach NewsAPI';
    }

    return res.status(statusCode).json({ 
      success: false,
      error: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString()
    });
  }
}