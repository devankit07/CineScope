const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p';

export const getTmdbUrl = (path, params = {}) => {
  const key = process.env.TMDB_API_KEY || '';
  const search = new URLSearchParams({ api_key: key, ...params });
  return `${TMDB_BASE}${path}?${search}`;
};

export const getPosterUrl = (path, size = 'w500') => {
  if (!path) return null;
  return `${TMDB_IMG}/${size}${path}`;
};

export const getBackdropUrl = (path, size = 'original') => {
  if (!path) return null;
  return `${TMDB_IMG}/${size}${path}`;
};
