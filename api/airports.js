// FlightCore Proxy — api/airports.js
// GET /api/airports?q=ICN

const IGNAV_BASE = 'https://ignav.com/api';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Api-Key');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const apiKey = req.headers['x-api-key'] || process.env.IGNAV_API_KEY;
  if (!apiKey) return res.status(401).json({ error: 'API Key 없음' });

  const q = req.query.q || '';
  const limit = req.query.limit || 5;

  try {
    const upstream = await fetch(
      `${IGNAV_BASE}/airports?q=${encodeURIComponent(q)}&limit=${limit}`,
      { headers: { 'X-Api-Key': apiKey } }
    );
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: '업스트림 오류', detail: err.message });
  }
}
