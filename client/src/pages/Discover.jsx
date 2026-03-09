import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSearchResults,
  appendSearchResults,
  setLoading,
  setPage,
  setHasMore,
  resetDiscover,
} from '@/redux/slices/movieSlice';
import { tmdb } from '@/services/tmdb';
import { moviesApi } from '@/services/api';
import MovieGrid from '@/components/MovieGrid';
import GenreFilter from '@/components/GenreFilter';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

export default function Discover() {
  const dispatch = useDispatch();
  const { filters, searchResults, page, hasMore, loading } = useSelector((s) => s.movies);

  const extractYouTubeKey = (value) => {
    if (!value) return null;
    const raw = String(value).trim();
    if (!raw) return null;
    if (/^[a-zA-Z0-9_-]{6,}$/.test(raw) && !raw.startsWith('http')) return raw;
    try {
      const u = new URL(raw);
      if (u.hostname.includes('youtu.be')) return u.pathname.replace('/', '') || null;
      if (u.hostname.includes('youtube.com')) {
        if (u.searchParams.get('v')) return u.searchParams.get('v');
        const parts = u.pathname.split('/');
        const embedIdx = parts.findIndex((p) => p === 'embed');
        if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];
      }
    } catch {
      return null;
    }
    return null;
  };

  const getAdminPoster = (m) => {
    if (m.posterUrl) return m.posterUrl;
    const key = extractYouTubeKey(m.trailerYouTubeLink);
    return key ? `https://img.youtube.com/vi/${key}/hqdefault.jpg` : '';
  };

  const mapAdminMovie = (m) => ({
    id: `custom:${m._id}`,
    sourceMovieId: m.movieId,
    title: m.title,
    posterUrl: getAdminPoster(m),
    poster_path: '',
    release_date: m.releaseDate || '',
    vote_average: Number(m.rating) || 0,
    overview: m.description || '',
    genre: Array.isArray(m.genre) ? m.genre : [],
    trailerYouTubeLink: m.trailerYouTubeLink || '',
    isCustom: true,
  });

  const loadFirstPage = useCallback(() => {
    dispatch(setLoading(true));
    const page = 1;
    Promise.all([
      tmdb.discover({
        page,
        with_genres: filters.genre || '',
        year: filters.year || '',
        sortBy: filters.sortBy || 'popularity.desc',
        voteAverage: filters.rating || '',
      }),
      moviesApi.getPublic({ limit: 24 }).catch(() => ({ data: [] })),
    ])
      .then(([data, adminRes]) => {
        const tmdbList = data?.results ?? [];
        const hasActiveFilters = !!(filters.genre || filters.year || filters.rating);
        const adminList = hasActiveFilters
          ? []
          : (adminRes?.data ?? []).map(mapAdminMovie);
        const adminIds = new Set(adminList.map((m) => String(m.id)));
        const merged = [...adminList, ...tmdbList.filter((m) => !adminIds.has(String(m.id)))];
        dispatch(setSearchResults(merged));
        dispatch(setPage(2));
        dispatch(setHasMore((data?.total_pages ?? 1) > 1));
      })
      .catch(() => dispatch(setHasMore(false)))
      .finally(() => dispatch(setLoading(false)));
  }, [dispatch, filters.genre, filters.year, filters.sortBy, filters.rating]);

  const loadNextPage = useCallback(() => {
    if (loading || !hasMore) return;
    dispatch(setLoading(true));
    tmdb
      .discover({
        page,
        with_genres: filters.genre || '',
        year: filters.year || '',
        sortBy: filters.sortBy || 'popularity.desc',
        voteAverage: filters.rating || '',
      })
      .then((data) => {
        const list = data?.results ?? [];
        dispatch(appendSearchResults(list));
        dispatch(setPage(page + 1));
        dispatch(setHasMore((data?.total_pages ?? 1) > (data?.page ?? 1)));
      })
      .catch(() => dispatch(setHasMore(false)))
      .finally(() => dispatch(setLoading(false)));
  }, [dispatch, filters.genre, filters.year, filters.sortBy, filters.rating, page, hasMore, loading]);

  useEffect(() => {
    dispatch(resetDiscover());
    loadFirstPage();
  }, [dispatch, loadFirstPage]);

  const sentinelRef = useInfiniteScroll(loadNextPage, { enabled: hasMore && !loading });

  return (
    <div>
      <div className="px-4 sm:px-6 py-6">
        <h1 className="font-sansation text-3xl font-bold text-white mb-2">Discover</h1>
        <p className="text-gray-400">Browse with filters and infinite scroll</p>
      </div>
      <GenreFilter />
      <MovieGrid
        movies={searchResults}
        loading={loading && page === 1}
        title=""
      />
      {page > 1 && loading && (
        <div className="flex justify-center py-8">
          <span className="text-gray-400">Loading more...</span>
        </div>
      )}
      <div ref={sentinelRef} className="h-4" />
    </div>
  );
}
