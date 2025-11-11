// api/index.js –– Vercel serverless entry point
export default async function handler(req, res) {
  // ===== CORS Configuration =====
  // Allow requests from any origin (consider restricting in production)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ===== Method Validation =====
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ===== Extract Service Parameter =====
  const { service } = req.query;

  // Initialize variables for the request
  let url, key, headers = {};

  try {
    // ===== Determine Target Service =====
    switch (service) {

      // ----- NewsAPI Service -----
      case 'newsApi': {
        key = process.env.NEWS_KEY;
        const { category, q, pageSize, page, sources, sortBy } = req.query;

        // Choose endpoint based on presence of category
        const base = category ? '/v2/top-headlines' : '/v2/everything';

        // Build query parameters
        const sp = new URLSearchParams({ apiKey: key });
        if (category) sp.set('category', category);
        if (q) sp.set('q', q);
        if (pageSize) sp.set('pageSize', pageSize);
        if (page) sp.set('page', page);
        if (sources) sp.set('sources', sources);
        if (sortBy) sp.set('sortBy', sortBy);

        // Construct full API URL
        url = `https://newsapi.org${base}?${sp}`;
        break;
      }

      // ----- Unsplash Service -----
      case 'unsplash': {
        key = process.env.UNSPLASH_KEY;
        const { query, per_page = 1, orientation = 'landscape' } = req.query;

        // Build query parameters for Unsplash
        const sp = new URLSearchParams({
          client_id: key,
          query: query || 'finance',
          per_page,
          orientation
        });

        // Construct full API URL
        url = `https://api.unsplash.com/search/photos?${sp}`;
        break;
      }

      // ----- YouTube Service -----
      case 'youtube': {
        key = process.env.YOUTUBE_KEY;
        const { q, maxResults = 5, part = 'snippet', type = 'video' } = req.query;

        // Build query parameters for YouTube
        const sp = new URLSearchParams({
          key,
          q: q || 'finance news',
          part,
          type,
          maxResults
        });

        // Construct full API URL
        url = `https://www.googleapis.com/youtube/v3/search?${sp}`;
        break;
      }

      // ----- Unknown Service -----
      default:
        return res.status(400).json({ error: 'Unknown service' });
    }

    // ===== Fetch Data from Target Service =====
    const fetchRes = await fetch(url, { headers });

    // ===== Handle HTTP Errors =====
    if (!fetchRes.ok) {
      const text = await fetchRes.text(); // get raw error message
      return res.status(fetchRes.status).json({ error: text });
    }

    // ===== Parse Response as JSON =====
    const data = await fetchRes.json();

    // ===== Return Data to Client =====
    return res.status(200).json(data);

  } catch (err) {
    // ===== Catch Unexpected Errors =====
    console.error(err);
    return res.status(500).json({
      error: 'Proxy crash',
      detail: err.message
    });
  }
}
