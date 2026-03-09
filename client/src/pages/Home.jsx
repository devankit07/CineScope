import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import HeroBanner from '@/components/HeroBanner';
import MovieGrid from '@/components/MovieGrid';
import MovieCard from '@/components/MovieCard';
import {
  setTrending,
  setPopular,
  setTopRated,
  setUpcoming,
  setLoading,
} from '@/redux/slices/movieSlice';
import { fetchSectionResults } from '@/services/omdb';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { trending, popular, topRated, upcoming, loading } = useSelector((s) => s.movies);
  const historyItems = useSelector((s) => s.history.items).slice(0, 10);
  const favoritesItems = useSelector((s) => s.favorites.items);
  const favoriteGenreIds = useMemo(() => {
    const set = new Set();
    favoritesItems.forEach((f) => (f.genre || []).forEach((g) => set.add(g)));
    return Array.from(set).filter(Boolean).slice(0, 3);
  }, [favoritesItems]);
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    dispatch(setLoading(true));
    fetchSectionResults()
      .then(({ trending, popular, topRated, upcoming }) => {
        dispatch(setTrending(trending ?? []));
        dispatch(setPopular(popular ?? []));
        dispatch(setTopRated(topRated ?? []));
        dispatch(setUpcoming(upcoming ?? []));
      })
      .catch(() => {
        dispatch(setTrending([]));
        dispatch(setPopular([]));
        dispatch(setTopRated([]));
        dispatch(setUpcoming([]));
      })
      .finally(() => dispatch(setLoading(false)));
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated || favoriteGenreIds.length === 0) return;
    const with_genres = favoriteGenreIds.join(',');
    fetchSectionResults().then((d) => setRecommended(d.popular ?? [])).catch(() => setRecommended([]));
  }, [isAuthenticated, favoriteGenreIds.join(',')]);

  const heroContent = {
    title: 'Discover. Watch. Remember.',
    description: 'Your next favorite story is here. Explore thousands of movies, save favorites, and pick up where you left off—all in one place.',
    buttonText: 'Explore Movies',
    buttonLink: '/discover',
  };

  return (
    <div>
      <HeroBanner heroContent={heroContent} />
      {isAuthenticated && historyItems.length > 0 && (
        <section className="px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sansation text-2xl font-bold text-white">Continue Watching</h2>
            <Link to="/history" className="text-accent-red hover:underline text-sm">See all</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {historyItems.map((h) => (
              <div key={h.movieId} className="flex-shrink-0 w-36">
                <MovieCard
                  movie={{
                    id: h.movieId,
                    title: h.title,
                    posterUrl: h.posterUrl,
                    poster_path: null,
                    release_date: h.releaseDate,
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      )}
      {isAuthenticated && recommended.length > 0 && (
        <MovieGrid movies={recommended} title="Recommended For You" subtitle="Based on your favorite genres" />
      )}
      <MovieGrid movies={trending} loading={loading} title="Trending Now" />
      <MovieGrid movies={popular} title="Popular" />
      <MovieGrid movies={topRated} title="Top Rated" />
      <MovieGrid movies={upcoming} title="Upcoming" />
    </div>
  );
}
