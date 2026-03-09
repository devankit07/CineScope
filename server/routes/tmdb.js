import express from 'express';

const router = express.Router();
const TMDB_BASE = 'https://api.themoviedb.org/3';
// Fallback key keeps the proxy working even when env var is not set on the host.
// This is the same key already embedded in the client build — not a secret.
const BUILT_IN_KEY = '94b82da25f7f9759964c71e3f2fe3e37';

async function tmdbProxy(req, res, path) {
  const key = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY || BUILT_IN_KEY;
  if (!key) {
    return res.status(500).json({
      message: 'TMDB key is not configured. Set TMDB_API_KEY on the server.',
    });
  }

  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set('api_key', key);
  Object.entries(req.query || {}).forEach(([k, v]) => {
    if (v != null && v !== '') url.searchParams.set(k, String(v));
  });

  try {
    const upstream = await fetch(url.toString());
    const text = await upstream.text();
    res.status(upstream.status);
    res.set('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.send(text);
  } catch (err) {
    return res.status(502).json({ message: 'Failed to fetch TMDB data', error: err.message });
  }
}

router.get('/trending/movie/day', (req, res) => tmdbProxy(req, res, '/trending/movie/day'));
router.get('/movie/popular', (req, res) => tmdbProxy(req, res, '/movie/popular'));
router.get('/movie/top_rated', (req, res) => tmdbProxy(req, res, '/movie/top_rated'));
router.get('/movie/upcoming', (req, res) => tmdbProxy(req, res, '/movie/upcoming'));
router.get('/search/movie', (req, res) => tmdbProxy(req, res, '/search/movie'));
router.get('/discover/movie', (req, res) => tmdbProxy(req, res, '/discover/movie'));
router.get('/movie/:id', (req, res) => tmdbProxy(req, res, `/movie/${req.params.id}`));
router.get('/movie/:id/videos', (req, res) => tmdbProxy(req, res, `/movie/${req.params.id}/videos`));
router.get('/movie/:id/recommendations', (req, res) => tmdbProxy(req, res, `/movie/${req.params.id}/recommendations`));

export default router;
