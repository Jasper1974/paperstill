// Vercel Serverless Function - PubMed proxy
// Bypasses CORS by fetching PubMed from server side
export default async function handler(req, res) {
  // Allow all origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { action, ids, term, retmax, reldate, mindate, maxdate } = req.query;
  const base = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';

  try {
    let url;
    if (action === 'search') {
      url = base + 'esearch.fcgi?db=pubmed&retmode=json&sort=relevance';
      url += '&term=' + encodeURIComponent(term || '');
      url += '&retmax=' + (retmax || 20);
      if (reldate) url += '&datetype=pdat&reldate=' + reldate;
      else if (mindate && maxdate) url += '&datetype=pdat&mindate=' + mindate + '&maxdate=' + maxdate;
    } else if (action === 'fetch') {
      url = base + 'efetch.fcgi?db=pubmed&rettype=abstract&retmode=xml';
      url += '&id=' + (ids || '');
    } else {
      res.status(400).json({ error: 'Invalid action' });
      return;
    }

    const response = await fetch(url, {
      headers: { 'User-Agent': 'ScienceContentOS/1.0 (research tool)' }
    });
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('json')) {
      const data = await response.json();
      res.status(200).json(data);
    } else {
      const text = await response.text();
      res.setHeader('Content-Type', 'application/xml');
      res.status(200).send(text);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
