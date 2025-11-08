// api/unsplash-redirect.js
export default async (req, res) => {
  const { query = 'finance' } = req.query;
  const redirectUrl = `https://source.unsplash.com/800x450/?${encodeURIComponent(query)}`;
  try {
    const r = await fetch(redirectUrl, { method: 'HEAD' });
    const finalUrl = r.url || redirectUrl;
    return res.status(200).json({ url: finalUrl });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};