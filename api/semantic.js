// Vercel Serverless Function - Semantic Scholar proxy
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { query, limit } = req.query;
  if (!query) { res.status(400).json({ error: 'Missing query' }); return; }

  try {
    const url = 'https://api.semanticscholar.org/graph/v1/paper/search?query='
      + encodeURIComponent(query)
      + '&limit=' + (limit || 15)
      + '&fields=title,abstract,year,venue,externalIds,publicationDate'
      + '&sort=relevance';
    const r = await fetch(url, {
      headers: { 'User-Agent': 'ScienceContentOS/1.0' }
    });
    const data = await r.json();
    res.status(200).json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
