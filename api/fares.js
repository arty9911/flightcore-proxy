// FlightCore Proxy — api/fares.js
// Vercel Serverless Function: Ignav API CORS 프록시
// POST /api/fares?type=one-way  or  ?type=round-trip

const IGNAV_BASE = 'https://ignav.com/api';

export default async function handler(req, res) {
  // CORS 헤더 (모든 오리진 허용 — 본인 도메인만 허용하려면 변경)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Api-Key');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  const VALID_TYPES = ['one-way', 'round-trip', 'booking-links'];
  const type = VALID_TYPES.includes(req.query.type) ? req.query.type : 'one-way';
  const apiKey = req.headers['x-api-key'] || process.env.IGNAV_API_KEY;

  if (!apiKey) {
    return res.status(401).json({ error: 'API Key 없음. X-Api-Key 헤더 또는 환경변수 IGNAV_API_KEY 필요' });
  }

  try {
    const upstream = await fetch(`${IGNAV_BASE}/fares/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify(req.body),
    });

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: '업스트림 오류', detail: err.message });
  }
}
