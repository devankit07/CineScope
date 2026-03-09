import { motion } from 'framer-motion';
import MovieCard from './MovieCard';
import LoaderSkeleton from './LoaderSkeleton';

export default function FavoritesGrid({ items, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 px-4 sm:px-6 py-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <LoaderSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (!items?.length) {
    return (
      <div className="px-4 sm:px-6 py-16 text-center">
        <p className="text-gray-400 text-lg">No favorites yet. Add movies from Discover or movie pages.</p>
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 px-4 sm:px-6 py-8"
    >
      {items.map((fav) => (
        <MovieCard
          key={fav.movieId}
          movie={{
            id: fav.movieId,
            title: fav.title,
            poster_path: null,
            posterUrl: fav.posterUrl,
            release_date: fav.releaseDate,
            releaseDate: fav.releaseDate,
            vote_average: fav.rating,
            rating: fav.rating,
            genre_ids: fav.genre,
          }}
        />
      ))}
    </motion.div>
  );
}
