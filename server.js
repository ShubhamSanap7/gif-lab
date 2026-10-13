require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 1. In-Memory Cache (10-minute TTL)
// ==========================================
class MemoryCache {
  constructor(ttlMs = 10 * 60 * 1000) {
    this.ttlMs = ttlMs;
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value) {
    // Cleanup if store gets too large
    if (this.store.size > 2000) {
      const now = Date.now();
      for (const [k, v] of this.store.entries()) {
        if (now > v.expiry) this.store.delete(k);
      }
    }
    this.store.set(key, {
      value,
      expiry: Date.now() + this.ttlMs
    });
  }
}

const apiCache = new MemoryCache(10 * 60 * 1000);

// ==========================================
// 2. In-Memory Per-IP Rate Limiting
// ==========================================
const ipRateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests/min per IP

function rateLimiter(req, res, next) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  let clientData = ipRateLimitMap.get(ip);

  if (!clientData || now - clientData.startTime > RATE_LIMIT_WINDOW_MS) {
    clientData = { startTime: now, count: 1 };
  } else {
    clientData.count++;
  }
  ipRateLimitMap.set(ip, clientData);

  // Periodically clean stale entries
  if (ipRateLimitMap.size > 5000) {
    for (const [key, val] of ipRateLimitMap.entries()) {
      if (now - val.startTime > RATE_LIMIT_WINDOW_MS) {
        ipRateLimitMap.delete(key);
      }
    }
  }

  if (clientData.count > MAX_REQUESTS_PER_WINDOW) {
    res.setHeader('Retry-After', '60');
    return res.status(429).json({
      error: 'Rate limit exceeded. Please wait a minute before making more requests.'
    });
  }

  next();
}

// ==========================================
// 3. Provider Interface & Giphy Implementation
// ==========================================
class GifProvider {
  /**
   * Search for GIFs
   * @param {string} query
   * @param {number} offset
   * @param {number} limit
   * @returns {Promise<{results: Array, totalCount: number}>}
   */
  async search(query, offset = 0, limit = 24) {
    throw new Error('search() not implemented in GifProvider');
  }

  /**
   * Fetch Trending GIFs
   * @param {number} offset
   * @param {number} limit
   * @returns {Promise<{results: Array, totalCount: number}>}
   */
  async trending(offset = 0, limit = 24) {
    throw new Error('trending() not implemented in GifProvider');
  }
}

class GiphyProvider extends GifProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.giphy.com/v1/gifs';
  }

  hasValidKey() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0 && this.apiKey !== 'your_giphy_api_key_here');
  }

  _formatItem(item) {
    const images = item.images || {};
    // Downsized or fixed_width GIF URL for editing (cap bandwidth and frames)
    const gifUrl =
      images.downsized?.url ||
      images.downsized_medium?.url ||
      images.fixed_width?.url ||
      images.original?.url ||
      '';

    // Thumbnail for grid presentation
    const thumbnail =
      images.fixed_width_downsampled?.url ||
      images.fixed_width_small?.url ||
      images.fixed_width?.url ||
      images.preview_gif?.url ||
      images.downsized_small?.url ||
      gifUrl;

    return {
      id: item.id,
      title: item.title || 'Untitled GIF',
      thumbnail,
      gifUrl,
      width: parseInt(images.downsized?.width || images.original?.width || 300, 10),
      height: parseInt(images.downsized?.height || images.original?.height || 200, 10)
    };
  }

  _getDemoGifs(query = '') {
    // Curated high quality public GIFs fallback if user hasn't set GIPHY_API_KEY yet
    const demos = [
      {
        id: 'demo-cat-typing',
        title: 'Bongo Cat Typing',
        thumbnail: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/200w.gif',
        gifUrl: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy-downsized.gif',
        width: 320,
        height: 240
      },
      {
        id: 'demo-popcorn',
        title: 'Popcorn Eating Michael Jackson',
        thumbnail: 'https://media.giphy.com/media/gl0mkIZOW6Nwc/200w.gif',
        gifUrl: 'https://media.giphy.com/media/gl0mkIZOW6Nwc/giphy-downsized.gif',
        width: 320,
        height: 240
      },
      {
        id: 'demo-mind-blown',
        title: 'Mind Blown Tim and Eric',
        thumbnail: 'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/200w.gif',
        gifUrl: 'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy-downsized.gif',
        width: 320,
        height: 240
      },
      {
        id: 'demo-dancing-baby',
        title: 'Dancing Groovy',
        thumbnail: 'https://media.giphy.com/media/DhstvI3zZ598Nb1rFf/200w.gif',
        gifUrl: 'https://media.giphy.com/media/DhstvI3zZ598Nb1rFf/giphy-downsized.gif',
        width: 320,
        height: 240
      },
      {
        id: 'demo-nodding',
        title: 'Robert Redford Nod',
        thumbnail: 'https://media.giphy.com/media/gVoBC0SuaHStq/200w.gif',
        gifUrl: 'https://media.giphy.com/media/gVoBC0SuaHStq/giphy-downsized.gif',
        width: 320,
        height: 240
      },
      {
        id: 'demo-sponge-rainbow',
        title: 'SpongeBob Imagination',
        thumbnail: 'https://media.giphy.com/media/BQUITFiYVtNte/200w.gif',
        gifUrl: 'https://media.giphy.com/media/BQUITFiYVtNte/giphy-downsized.gif',
        width: 320,
        height: 240
      },
      {
        id: 'demo-confused-travolta',
        title: 'Confused Travolta',
        thumbnail: 'https://media.giphy.com/media/g01ZnwAUvutuK8GIQn/200w.gif',
        gifUrl: 'https://media.giphy.com/media/g01ZnwAUvutuK8GIQn/giphy-downsized.gif',
        width: 320,
        height: 240
      },
      {
        id: 'demo-doge',
        title: 'Much Wow Doge',
        thumbnail: 'https://media.giphy.com/media/QrPz293n6464g/200w.gif',
        gifUrl: 'https://media.giphy.com/media/QrPz293n6464g/giphy-downsized.gif',
        width: 320,
        height: 240
      }
    ];

    if (!query) return demos;
    const lower = query.toLowerCase();
    const filtered = demos.filter(d => d.title.toLowerCase().includes(lower));
    return filtered.length > 0 ? filtered : demos;
  }

  async search(query, offset = 0, limit = 24) {
    if (!this.hasValidKey()) {
      const demoList = this._getDemoGifs(query);
      return {
        results: demoList,
        totalCount: demoList.length,
        notice: 'Demo mode active. Add GIPHY_API_KEY in .env for live Giphy search.'
      };
    }

    const url = new URL(`${this.baseUrl}/search`);
    url.searchParams.set('api_key', this.apiKey);
    url.searchParams.set('q', query);
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('rating', 'g');

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`GIPHY API error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return {
      results: (data.data || []).map(this._formatItem),
      totalCount: data.pagination?.total_count || 0
    };
  }

  async trending(offset = 0, limit = 24) {
    if (!this.hasValidKey()) {
      const demoList = this._getDemoGifs();
      return {
        results: demoList,
        totalCount: demoList.length,
        notice: 'Demo mode active. Add GIPHY_API_KEY in .env for live Giphy trending.'
      };
    }

    const url = new URL(`${this.baseUrl}/trending`);
    url.searchParams.set('api_key', this.apiKey);
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('rating', 'g');

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`GIPHY API error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return {
      results: (data.data || []).map(this._formatItem),
      totalCount: data.pagination?.total_count || 0
    };
  }
}

// Active GIF Provider
const activeProvider = new GiphyProvider(process.env.GIPHY_API_KEY);

// ==========================================
// 4. Middlewares & Static Serving
// ==========================================
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Apply rate limiting to all /api/ routes
app.use('/api/', rateLimiter);

// ==========================================
// 5. API Endpoints
// ==========================================

// GET /api/trending?offset=
app.get('/api/trending', async (req, res) => {
  const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 24));
  const cacheKey = `trending:${offset}:${limit}`;

  const cached = apiCache.get(cacheKey);
  if (cached) {
    return res.json({ ...cached, cached: true });
  }

  try {
    const data = await activeProvider.trending(offset, limit);
    apiCache.set(cacheKey, data);
    res.json(data);
  } catch (err) {
    console.error('Error fetching trending:', err.message);
    res.status(502).json({ error: 'Failed to fetch trending GIFs', details: err.message });
  }
});

// GET /api/search?q=&offset=
app.get('/api/search', async (req, res) => {
  const query = (req.query.q || '').trim();
  const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 24));

  if (!query) {
    // If empty query, fall back to trending as per specification
    const cacheKey = `trending:${offset}:${limit}`;
    const cached = apiCache.get(cacheKey);
    if (cached) return res.json({ ...cached, cached: true });

    try {
      const data = await activeProvider.trending(offset, limit);
      apiCache.set(cacheKey, data);
      return res.json(data);
    } catch (err) {
      return res.status(502).json({ error: 'Failed to fetch trending GIFs', details: err.message });
    }
  }

  const cacheKey = `search:${query.toLowerCase()}:${offset}:${limit}`;
  const cached = apiCache.get(cacheKey);
  if (cached) {
    return res.json({ ...cached, cached: true });
  }

  try {
    const data = await activeProvider.search(query, offset, limit);
    apiCache.set(cacheKey, data);
    res.json(data);
  } catch (err) {
    console.error('Error fetching search:', err.message);
    res.status(502).json({ error: 'Failed to search GIFs', details: err.message });
  }
});

// GET /api/gif?url=...
// Streams the chosen GIF strictly from Giphy CDN to prevent open proxy abuse & avoid CORS
app.get('/api/gif', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "url" parameter.' });
  }

  let parsed;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return res.status(400).json({ error: 'Malformed URL provided.' });
  }

  // Strict Hostname Validation:
  // Must end in .giphy.com and match media / i hosts (e.g. media.giphy.com, media0..4.giphy.com, i.giphy.com)
  const host = parsed.hostname.toLowerCase();
  const isAllowedHost =
    /^media[0-9]?\.giphy\.com$/.test(host) ||
    host === 'i.giphy.com' ||
    host === 'media.giphy.com';

  if (!isAllowedHost) {
    return res.status(403).json({
      error: 'Forbidden host. Only media.giphy.com URLs are allowed through this proxy.'
    });
  }

  // Only allow http/https
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return res.status(400).json({ error: 'Invalid URL protocol.' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const upstreamRes = await fetch(parsed.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'GIF-Lab-Server/1.0'
      }
    });
    clearTimeout(timeout);

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({
        error: `Upstream error fetching GIF: ${upstreamRes.statusText}`
      });
    }

    const contentType = upstreamRes.headers.get('content-type') || 'image/gif';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache on client for 1 day
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Convert to buffer and send
    const arrayBuffer = await upstreamRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (err) {
    console.error('Error streaming GIF proxy:', err.message);
    res.status(502).json({ error: 'Failed to stream GIF', details: err.message });
  }
});

// Fallback to index.html for single-page routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start listening
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[GIF Lab] Server running on http://localhost:${PORT}`);
    console.log(`[GIF Lab] GIPHY API key configured: ${activeProvider.hasValidKey() ? 'YES' : 'NO (Demo mode active)'}`);
  });
}

module.exports = app;
