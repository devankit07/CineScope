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
import { omdb } from '@/services/omdb';
import MovieGrid from '@/components/MovieGrid';
import GenreFilter from '@/components/GenreFilter';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

export default function Discover() {
  const dispatch = useDispatch();
  const { filters, searchResults, page, hasMore, loading } = useSelector((s) => s.movies);

  const loadFirstPage = useCallback(() => {
    dispatch(setLoading(true));
    const searchTerm = filters.genre || 'movie';
    const page = 1;
    omdb
      .search(searchTerm, page, filters.year || '')
      .then((data) => {
        const list = data.results ?? [];
        dispatch(setSearchResults(list));
        dispatch(setPage(2));
        dispatch(setHasMore((data.total_pages ?? 1) > 1));
      })
      .catch(() => dispatch(setHasMore(false)))
      .finally(() => dispatch(setLoading(false)));
  }, [dispatch, filters.genre, filters.year]);

  const loadNextPage = useCallback(() => {
    if (loading || !hasMore) return;
    dispatch(setLoading(true));
    const searchTerm = filters.genre || 'movie';
    omdb
      .search(searchTerm, page, filters.year || '')
      .then((data) => {
        const list = data.results ?? [];
        dispatch(appendSearchResults(list));
        dispatch(setPage(page + 1));
        dispatch(setHasMore((data.total_pages ?? 1) > (data.page ?? 1)));
      })
      .catch(() => dispatch(setHasMore(false)))
      .finally(() => dispatch(setLoading(false)));
  }, [dispatch, filters.genre, filters.year, page, hasMore, loading]);

  useEffect(() => {
    dispatch(resetDiscover());
    loadFirstPage();
  }, [filters.genre, filters.year, dispatch]);

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
