// api/index.js  ––  Vercel serverless entry point
export default async function handler(req, res) {
  // allow CORS from anywhere (lock down later if you want)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // only GET
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { service } = req.query;
  let url, key, headers = {};

  try {
    switch (service) {
      case 'newsApi': {
        key = process.env.NEWS_KEY;
        const { category, q, pageSize, page, sources, sortBy } = req.query;
        const base = category ? '/v2/top-headlines' : '/v2/everything';
        const sp = new URLSearchParams({ apiKey: key });
        if (category) sp.set('category', category);
        if (q) sp.set('q', q);
        if (pageSize) sp.set('pageSize', pageSize);
        if (page) sp.set('page', page);
        if (sources) sp.set('sources', sources);
        if (sortBy) sp.set('sortBy', sortBy);
        url = `https://newsapi.org${base}?${sp}`;
        break;
      }

      case 'unsplash': {
        key = process.env.UNSPLASH_KEY;
        const { query, per_page = 1, orientation = 'landscape' } = req.query;
        const sp = new URLSearchParams({
          client_id: key,
          query: query || 'finance',
          per_page,
          orientation
        });
        url = `https://api.unsplash.com/search/photos?${sp}`;
        break;
      }

      case 'youtube': {
        key = process.env.YOUTUBE_KEY;
        const { q, maxResults = 5, part = 'snippet', type = 'video' } = req.query;
        const sp = new URLSearchParams({
          key,
          q: q || 'finance news',
          part,
          type,
          maxResults
        });
        url = `https://www.googleapis.com/youtube/v3/search?${sp}`;
        break;
      }

      default:
        return res.status(400).json({ error: 'Unknown service' });
    }

    const fetchRes = await fetch(url, { headers });
    if (!fetchRes.ok) {
      // forward the real status & message
      const text = await fetchRes.text();
      return res.status(fetchRes.status).json({ error: text });
    }
    const data = await fetchRes.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Proxy crash', detail: err.message });
  }
}