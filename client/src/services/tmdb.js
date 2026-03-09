const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p';

const getKey = () => (import.meta.env.VITE_TMDB_KEY || '').trim();

/** Returns true if a TMDB API key is configured. */
export const hasTmdbKey = () => !!getKey();

export const tmdb = {
  get: async (path, params = {}) => {
    const key = getKey();
    if (!key || key === 'your_tmdb_api_key') {
      console.warn('CineScope: VITE_TMDB_KEY is missing or placeholder. Add your key in .env — get one at https://www.themoviedb.org/settings/api');
      return { results: [], total_pages: 0, page: 1 };
    }
    const url = new URL(`${TMDB_BASE}${path}`);
    url.searchParams.set('api_key', key);
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== '') url.searchParams.set(k, String(v));
    });
    try {
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('TMDB request failed');
      return res.json();
    } catch (err) {
      console.warn('TMDB request failed:', err.message);
      return { results: [], total_pages: 0, page: 1 };
    }
  },
};

export const getPosterUrl = (path, size = 'w500') =>
  path ? `${TMDB_IMG}/${size}${path}` : null;

export const getBackdropUrl = (path, size = 'original') =>
  path ? `${TMDB_IMG}/${size}${path}` : null;

export const endpoints = {
  trending: '/trending/movie/week',
  popular: '/movie/popular',
  topRated: '/movie/top_rated',
  upcoming: '/movie/upcoming',
  discover: '/discover/movie',
  search: '/search/movie',
  details: (id) => `/movie/${id}`,
  videos: (id) => `/movie/${id}/videos`,
  genres: '/genre/movie/list',
};

export const getYouTubeEmbedUrl = (key) =>
  key ? `https://www.youtube.com/embed/${key}?autoplay=1` : null;
