import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { getPosterUrl } from '@/services/omdb';
import { PLACEHOLDER_POSTER } from '@/utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import { openTrailerModal } from '@/redux/slices/uiSlice';
import { addFavorite, removeFavorite } from '@/redux/slices/favoritesSlice';
import { favoritesApi } from '@/services/api';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

export default function MovieCard({ movie, layout = 'poster' }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const favoriteItems = useSelector((s) => s.favorites.items);
  const movieId = String(movie.id || movie.imdbID || '');
  const isFavorite = useMemo(
    () => favoriteItems.some((f) => String(f.movieId) === movieId),
    [favoriteItems, movieId]
  );

  const poster = getPosterUrl(movie.poster_path || movie.posterUrl) || PLACEHOLDER_POSTER;
  const title = movie.title || 'Untitled';
  const rating = movie.vote_average ?? movie.rating ?? 0;
  const year = movie.release_date?.slice(0, 4) || movie.releaseDate?.slice(0, 4) || '';

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Sign in to add favorites');
      return;
    }
    try {
      if (isFavorite) {
        await favoritesApi.remove(movieId);
        dispatch(removeFavorite(movieId));
        toast.success('Removed from favorites');
      } else {
        const res = await favoritesApi.add({
          movieId,
          title,
          posterUrl: poster,
          releaseDate: movie.release_date || movie.releaseDate,
          rating,
          genre: movie.genre_ids || movie.genre || [],
        });
        dispatch(addFavorite(res.data));
        toast.success('Added to favorites');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const openTrailer = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(openTrailerModal({
      movieId,
      title: title,
      posterUrl: poster,
    }));
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group"
    >
      <Link to={`/movie/${movieId}`} className="block">
        <div className="relative rounded-xl overflow-hidden bg-dark-700 shadow-xl">
          <div className="aspect-[2/3] relative">
            <img
              src={poster}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => { e.target.src = PLACEHOLDER_POSTER; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={openTrailer}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  title="Trailer"
                >
                  <Icon icon="mdi:play" className="w-5 h-5" />
                </button>
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={handleFavorite}
                    className={cn(
                      'p-2 rounded-full transition-colors',
                      isFavorite ? 'text-red-500 bg-white/20' : 'bg-white/20 hover:bg-white/30'
                    )}
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Icon icon={isFavorite ? 'mdi:heart' : 'mdi:heart-outline'} className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            {rating > 0 && (
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 flex items-center gap-1">
                <Icon icon="mdi:star" className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <div className="p-3">
            <h3 className="font-sansation font-semibold text-white truncate">{title}</h3>
            {year && <p className="text-sm text-gray-400">{year}</p>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
