/**
 * TMDB API service — uses VITE_TMDB_API_KEY.
 * In development, requests are proxied through the Vite dev server (/tmdb → api.themoviedb.org/3)
 * to avoid CORS issues and bypass network restrictions.
 */
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

const getKey = () => (import.meta.env.VITE_TMDB_API_KEY || '').trim();

export const hasTmdbKey = () => !!getKey() && getKey() !== 'your_api_key_here';

/** Normalize TMDB list item to app shape */
function normalizeListItem(item) {
  if (!item) return null;
  return {
    id: item.id,
    title: item.title,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    release_date: item.release_date || '',
    year: item.release_date?.slice(0, 4) || '',
    vote_average: Number(item.vote_average) || 0,
    overview: item.overview || '',
    genre_ids: item.genre_ids || [],
    genre: [], // filled from details if needed
  };
}

/** Normalize TMDB movie details to app shape */
function normalizeMovie(m) {
  if (!m) return null;
  const genres = m.genres || [];
  return {
    id: m.id,
    title: m.title,
    poster_path: m.poster_path,
    backdrop_path: m.backdrop_path,
    release_date: m.release_date || '',
    year: m.release_date?.slice(0, 4) || '',
    vote_average: Number(m.vote_average) || 0,
    overview: m.overview || '',
    overview_long: m.overview,
    genre_ids: m.genre_ids || [],
    genre: genres.map((g) => g.name),
    genres: genres.map((g) => ({ id: g.id, name: g.name })),
    runtime: m.runtime ? `${m.runtime} min` : null,
    director: null, // TMDB doesn't include in main detail; would need credits
    actors: null,
  };
}

async function request(path, params = {}) {
  const key = getKey();
  const hasClientKey = !!key && key !== 'your_api_key_here' && key !== 'your_tmdb_api_key';
  // Prefer direct TMDB calls when client key exists (works on production too).
  // Fall back to server proxy when key is missing.
  const useServerProxy = !hasClientKey;
  const base = useServerProxy
    ? '/api/tmdb'
    : (import.meta.env.DEV ? '/tmdb' : 'https://api.themoviedb.org/3');
  const url = new URL(`${base}${path}`, window.location.origin);
  if (!useServerProxy) {
    url.searchParams.set('api_key', key);
  }
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') url.searchParams.set(k, String(v));
  });

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      let body = '';
      try { body = await res.text(); } catch {}
      console.error(`[TMDB] ${res.status} ${res.statusText} — ${path}`, body);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error(`[TMDB] Network error — ${path}:`, err.message);
    return null;
  }
}

export const tmdb = {
  /** GET /trending/movie/day */
  getTrending: async (page = 1) => {
    const data = await request('/trending/movie/day', { page });
    const list = data?.results || [];
    return { results: list.map(normalizeListItem).filter(Boolean), page: data?.page || 1, total_pages: data?.total_pages || 1 };
  },

  /** GET /movie/popular */
  getPopular: async (page = 1) => {
    const data = await request('/movie/popular', { page });
    const list = data?.results || [];
    return { results: list.map(normalizeListItem).filter(Boolean), page: data?.page || 1, total_pages: data?.total_pages || 1 };
  },

  /** GET /movie/top_rated */
  getTopRated: async (page = 1) => {
    const data = await request('/movie/top_rated', { page });
    const list = data?.results || [];
    return { results: list.map(normalizeListItem).filter(Boolean), page: data?.page || 1, total_pages: data?.total_pages || 1 };
  },

  /** GET /movie/upcoming */
  getUpcoming: async (page = 1) => {
    const data = await request('/movie/upcoming', { page });
    const list = data?.results || [];
    return { results: list.map(normalizeListItem).filter(Boolean), page: data?.page || 1, total_pages: data?.total_pages || 1 };
  },

  /** GET /search/movie */
  search: async (query, page = 1, year = '') => {
    const params = { query, page };
    if (year) params.primary_release_year = year;
    const data = await request('/search/movie', params);
    const list = data?.results || [];
    return {
      results: list.map(normalizeListItem).filter(Boolean),
      page: data?.page || 1,
      total_pages: data?.total_pages || 1,
      totalResults: data?.total_results || 0,
    };
  },

  /** GET /discover/movie — for genre/year/sort filters */
  discover: async (options = {}) => {
    const { page = 1, with_genres = '', year = '', sortBy = 'popularity.desc', voteAverage = '' } = options;
    const params = { page, sort_by: sortBy };
    if (with_genres) params.with_genres = with_genres;
    if (year) params.primary_release_year = year;
    if (voteAverage) params['vote_average.gte'] = voteAverage;
    const data = await request('/discover/movie', params);
    const list = data?.results || [];
    return {
      results: list.map(normalizeListItem).filter(Boolean),
      page: data?.page || 1,
      total_pages: data?.total_pages || 1,
      totalResults: data?.total_results || 0,
    };
  },

  /** GET /movie/{movie_id} */
  getById: async (movieId) => {
    const data = await request(`/movie/${movieId}`);
    return normalizeMovie(data);
  },

  /** GET /movie/{movie_id}/videos — returns YouTube trailer key */
  getVideos: async (movieId) => {
    const data = await request(`/movie/${movieId}/videos`);
    const results = data?.results || [];
    const trailer = results.find((v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
    return { key: trailer?.key || null, results };
  },

  /** GET /movie/{movie_id}/recommendations */
  getRecommendations: async (movieId, page = 1) => {
    const data = await request(`/movie/${movieId}/recommendations`, { page });
    const list = data?.results || [];
    return { results: list.map(normalizeListItem).filter(Boolean) };
  },
};

/** Build full poster URL from path */
export const getPosterUrl = (path) => {
  if (!path || String(path).toUpperCase() === 'N/A') return null;
  if (String(path).startsWith('http')) return path;
  return `${IMAGE_BASE}${path.startsWith('/') ? path : `/${path}`}`;
};

/** Build full backdrop URL from path */
export const getBackdropUrl = (path) => {
  if (!path || String(path).toUpperCase() === 'N/A') return null;
  if (String(path).startsWith('http')) return path;
  return `${IMAGE_BASE}${path.startsWith('/') ? path : `/${path}`}`;
};

/** YouTube embed URL for trailer key from TMDB */
export const getYouTubeEmbedUrl = (key) => (key ? `https://www.youtube.com/embed/${key}?autoplay=1` : null);

/**
 * Section helpers: trending, popular, topRated, upcoming from TMDB.
 */
export async function fetchSectionResults() {
  const [trendingRes, popularRes, topRatedRes, upcomingRes] = await Promise.all([
    tmdb.getTrending(1),
    tmdb.getPopular(1),
    tmdb.getTopRated(1),
    tmdb.getUpcoming(1),
  ]);
  return {
    trending: trendingRes?.results ?? [],
    popular: popularRes?.results ?? [],
    topRated: topRatedRes?.results ?? [],
    upcoming: upcomingRes?.results ?? [],
  };
}
