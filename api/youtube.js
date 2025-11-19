export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { endpoint, ...queryParams } = req.query;

  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint is required' });
  }

  const allowedEndpoints = ['videos', 'search', 'channels', 'playlistItems'];
  if (!allowedEndpoints.includes(endpoint)) {
    return res.status(400).json({ error: 'Invalid endpoint' });
  }

  const apiKey = process.env.YT_API_KEY || process.env.REACT_APP_YT_API;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);

    url.searchParams.append('key', apiKey);

    Object.keys(queryParams).forEach(k => {
      url.searchParams.append(k, queryParams[k]);
    });

    const ytResponse = await fetch(url.toString());

    if (!ytResponse.ok) {
      const txt = await ytResponse.text();
      return res.status(ytResponse.status).json({
        error: 'YouTube API error',
        details: txt,
      });
    }

    const json = await ytResponse.json();
    return res.status(200).json(json);
  } catch (err) {
    return res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
  }
}
