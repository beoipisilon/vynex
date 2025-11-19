const cache = new Map();
const pendingRequests = new Map();

const CACHE_TTL_LISTINGS = 10 * 60 * 1000;
const CACHE_TTL_VIDEO_DETAILS = 60 * 60 * 1000;

function getCacheKey(endpoint, params) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return `${endpoint}?${sortedParams}`;
}

function getCachedData(cacheKey, ttl) {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  if (cached) {
    cache.delete(cacheKey);
  }
  return null;
}

function setCachedData(cacheKey, data, ttl) {
  cache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl
  });
}

function getTTL(endpoint, params) {
  if (endpoint === 'videos' && params.id && !params.chart) {
    return CACHE_TTL_VIDEO_DETAILS;
  }
  return CACHE_TTL_LISTINGS;
}

function validateParams(endpoint, params) {
  const errors = [];

  switch (endpoint) {
    case 'videos':
      if (!params.id && !params.chart) {
        errors.push('Either "id" or "chart" parameter is required for videos endpoint');
      }
      break;
    case 'search':
      if (!params.q && !params.channelId) {
        errors.push('Either "q" or "channelId" parameter is required for search endpoint');
      }
      break;
    case 'channels':
      if (!params.id && !params.forUsername) {
        errors.push('Either "id" or "forUsername" parameter is required for channels endpoint');
      }
      break;
  }

  return errors;
}

function optimizeEndpoint(endpoint, params) {
  if (endpoint === 'search' && params.q) {
    const query = params.q.toLowerCase();
    
    if (query === 'music' || query === 'música') {
      return {
        endpoint: 'videos',
        params: {
          ...params,
          chart: 'mostPopular',
          videoCategoryId: '10',
          q: undefined
        }
      };
    }
  }
  
  return { endpoint, params };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let { endpoint, ...queryParams } = req.query;

  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint is required' });
  }

  const allowedEndpoints = ['videos', 'search', 'channels', 'playlistItems'];
  if (!allowedEndpoints.includes(endpoint)) {
    return res.status(400).json({ error: 'Invalid endpoint' });
  }

  const optimized = optimizeEndpoint(endpoint, queryParams);
  endpoint = optimized.endpoint;
  queryParams = optimized.params;

  const validationErrors = validateParams(endpoint, queryParams);
  if (validationErrors.length > 0) {
    return res.status(400).json({ 
      error: 'Invalid parameters',
      details: validationErrors 
    });
  }

  const cacheKey = getCacheKey(endpoint, queryParams);
  const ttl = getTTL(endpoint, queryParams);

  const cachedData = getCachedData(cacheKey, ttl);
  if (cachedData) {
    console.log(`[CACHE HIT] ${cacheKey}`);
    return res.status(200).json(cachedData);
  }

  if (pendingRequests.has(cacheKey)) {
    console.log(`[PENDING REQUEST] Waiting for existing request: ${cacheKey}`);
    try {
      const result = await pendingRequests.get(cacheKey);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ 
        error: 'Error from pending request',
        message: error.message 
      });
    }
  }

  const requestPromise = (async () => {
    const apiKey = process.env.REACT_APP_YT_API || process.env.YT_API_KEY;

    if (!apiKey) {
      throw new Error('API key not configured');
    }

    try {
      const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
      
      url.searchParams.append('key', apiKey);
      
      Object.keys(queryParams).forEach(key => {
        if (key !== 'endpoint' && queryParams[key] !== undefined) {
          url.searchParams.append(key, queryParams[key]);
        }
      });

      console.log(`[API REQUEST] ${url.toString()}`);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        let errorJson;
        try {
          errorJson = JSON.parse(errorData);
        } catch {
          errorJson = { error: errorData };
        }

        if (errorJson.error?.errors?.[0]?.reason === 'quotaExceeded') {
          console.error('[QUOTA EXCEEDED] YouTube API quota exceeded');
          const quotaError = {
            error: 'API quota exceeded',
            message: 'YouTube API quota has been exceeded. Please try again later.',
            retryAfter: 3600
          };
          throw { status: 429, data: quotaError };
        }

        throw { status: response.status, data: { error: 'YouTube API error', details: errorJson } };
      }

      const data = await response.json();
      
      setCachedData(cacheKey, data, ttl);
      console.log(`[CACHE SET] ${cacheKey} (TTL: ${ttl/1000/60} minutes)`);
      
      return data;
    } catch (error) {
      console.error('[PROXY ERROR]', error);
      throw error;
    }
  })();

  pendingRequests.set(cacheKey, requestPromise);

  try {
    const data = await requestPromise;
    return res.status(200).json(data);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json(error.data);
    }
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  } finally {
    pendingRequests.delete(cacheKey);
  }
};
