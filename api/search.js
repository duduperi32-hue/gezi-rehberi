const fetch = require('node-fetch');

/**
 * Vercel Serverless function: /api/search
 * Expects query parameter `q` with the search term.
 * Returns up to 3 Google Custom Search results (title, snippet, link).
 * Requires environment variables GOOGLE_API_KEY and GOOGLE_CSE_ID.
 */
module.exports = async (req, res) => {
  const query = req.query.q;
  if (!query) {
    res.status(400).json({ error: 'Missing q parameter' });
    return;
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;
  if (!apiKey || !cx) {
    res.status(500).json({ error: 'Google API key or Custom Search Engine ID not configured' });
    return;
  }

  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=3`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) {
      res.status(500).json({ error: data.error.message });
      return;
    }
    const results = (data.items || []).map(item => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link
    }));
    res.status(200).json({ results });
  } catch (e) {
    console.error('Google Custom Search fetch error:', e);
    res.status(500).json({ error: 'Fetch error' });
  }
};
