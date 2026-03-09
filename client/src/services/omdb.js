/**
 * OMDB API service — uses VITE_OMDB_API_KEY.
 * Maps OMDB responses to the app's expected movie shape.
 */
const OMDB_BASE = 'https://www.omdbapi.com';

function normalizeOmdbKey(raw) {
  const value = (raw || '').trim();
  if (!value) return '';
  // If user pasted a full OMDB URL, extract apikey query param.
  if (value.startsWith('http://') || value.startsWith('https://')) {
    try {
      const parsed = new URL(value);
      return (parsed.searchParams.get('apikey') || '').trim();
    } catch {
      return '';
    }
  }
  return value;
}

const getKey = () => normalizeOmdbKey(import.meta.env.VITE_OMDB_API_KEY || '');

export const hasOmdbKey = () => !!getKey() && getKey() !== 'your_omdb_api_key';

/** Normalize OMDB search result to app shape */
function normalizeSearchItem(item) {
  if (!item) return null;
  return {
    id: item.imdbID,
    title: item.Title,
    poster_path: item.Poster,
    posterUrl: item.Poster,
    release_date: item.Year ? `${item.Year}-01-01` : '',
    year: item.Year,
    vote_average: parseFloat(item.imdbRating) || 0,
    overview: item.Plot || '',
    genre: item.Genre ? item.Genre.split(',').map((g) => g.trim()) : [],
    imdbID: item.imdbID,
  };
}

/** Normalize OMDB by-ID response to app shape */
function normalizeMovie(m) {
  if (!m || m.Response === 'False') return null;
  return {
    id: m.imdbID,
    imdbID: m.imdbID,
    title: m.Title,
    poster_path: m.Poster,
    posterUrl: m.Poster,
    backdrop_path: m.Poster,
    release_date: m.Released || (m.Year ? `${m.Year}-01-01` : ''),
    year: m.Year,
    vote_average: parseFloat(m.imdbRating) || 0,
    overview: m.Plot || '',
    overview_long: m.Plot,
    genre: m.Genre ? m.Genre.split(',').map((g) => g.trim()) : [],
    genres: m.Genre ? m.Genre.split(',').map((g) => ({ name: g.trim() })) : [],
    runtime: m.Runtime,
    director: m.Director,
    actors: m.Actors,
  };
}

async function request(params) {
  const key = getKey();
  if (!key || key === 'your_omdb_api_key') {
    console.warn('CineScope: VITE_OMDB_API_KEY is missing. Add your key in .env — get one at https://www.omdbapi.com/apikey.aspx');
    return { Search: [], totalResults: '0' };
  }
  const url = new URL(OMDB_BASE);
  url.searchParams.set('apikey', key);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') url.searchParams.set(k, String(v));
  });
  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('OMDB request failed');
    return res.json();
  } catch (err) {
    console.warn('OMDB request failed:', err.message);
    return { Search: [], totalResults: '0' };
  }
}

export const omdb = {
  /** Search movies — returns { results: normalized[], totalResults, total_pages, page } */
  search: async (query, page = 1, year = '') => {
    const params = { s: query, type: 'movie', page };
    if (year) params.y = year;
    const data = await request(params);
    const list = Array.isArray(data.Search) ? data.Search : [];
    const total = parseInt(data.totalResults, 10) || 0;
    return {
      results: list.map(normalizeSearchItem).filter(Boolean),
      totalResults: total,
      total_pages: Math.ceil(total / 10) || 1,
      page,
    };
  },

  /** Get movie by IMDb ID */
  getById: async (imdbId) => {
    const data = await request({ i: imdbId, plot: 'full' });
    return normalizeMovie(data);
  },
};

/** OMDB returns full poster URL; pass-through. For compatibility with components. */
export const getPosterUrl = (pathOrUrl) => {
  if (!pathOrUrl) return null;
  if (String(pathOrUrl).toUpperCase() === 'N/A') return null;
  if (pathOrUrl.startsWith('http')) return pathOrUrl;
  return pathOrUrl;
};

/** OMDB has no backdrop; use poster URL if provided. */
export const getBackdropUrl = (pathOrUrl) => getPosterUrl(pathOrUrl);

/** No trailer from OMDB — return empty. */
export const getYouTubeEmbedUrl = (key) => (key ? `https://www.youtube.com/embed/${key}?autoplay=1` : null);

/**
 * Section helpers: OMDB has no trending/popular. We use search with different terms.
 */
const SECTION_QUERIES = ['movie', 'action', 'drama', '2024'];

export async function fetchSectionResults() {
  const [trending, popular, topRated, upcoming] = await Promise.all(
    SECTION_QUERIES.map((q) => omdb.search(q, 1).then((d) => d.results || []))
  );
  return { trending, popular, topRated, upcoming };
}
