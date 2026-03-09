import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { getPosterUrl, getBackdropUrl, tmdb } from '@/services/tmdb';
import { PLACEHOLDER_POSTER, DEFAULT_DESCRIPTION } from '@/utils/constants';
import { addToHistory } from '@/redux/slices/historySlice';
import { addFavorite, removeFavorite } from '@/redux/slices/favoritesSlice';
import { favoritesApi, historyApi, moviesApi } from '@/services/api';
import toast from 'react-hot-toast';
import LoaderSkeleton from '@/components/LoaderSkeleton';
import { useAuth } from '@/hooks/useAuth';

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth();
  const favoriteIds = useSelector((s) => s.favorites.items.map((f) => String(f.movieId)));
  const isFavorite = favoriteIds.includes(String(id));
  const isCustom = String(id).startsWith('custom:');
  const customId = isCustom ? String(id).replace('custom:', '') : null;

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

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    const request = isCustom
      ? moviesApi.getById(customId).then((res) => {
        const m = res.data;
        const trailerKey = extractYouTubeKey(m.trailerYouTubeLink);
        const fallbackPoster = trailerKey ? `https://img.youtube.com/vi/${trailerKey}/hqdefault.jpg` : '';
        return {
          id: `custom:${m._id}`,
          title: m.title,
          posterUrl: m.posterUrl || fallbackPoster,
          backdrop_path: '',
          release_date: m.releaseDate || '',
          vote_average: Number(m.rating) || 0,
          overview: m.description || '',
          genre: Array.isArray(m.genre) ? m.genre : [],
          trailerYouTubeLink: m.trailerYouTubeLink || '',
          isCustom: true,
        };
      })
      : tmdb.getById(id);
    request
      .then((data) => {
        if (!cancelled) setMovie(data);
      })
      .catch(() => { if (!cancelled) setMovie(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, isCustom, customId]);

  useEffect(() => {
    if (!movie || !isAuthenticated) return;
    historyApi.add({
      movieId: movie.id,
      title: movie.title,
      posterUrl: getPosterUrl(movie.poster_path || movie.posterUrl) || '',
    }).catch(() => {});
    dispatch(addToHistory({
      movieId: movie.id,
      title: movie.title,
      posterUrl: getPosterUrl(movie.poster_path || movie.posterUrl) || '',
    }));
  }, [movie?.id, isAuthenticated, dispatch]);

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Sign in to add favorites');
      return;
    }
    try {
      if (isFavorite) {
        await favoritesApi.remove(movie.id);
        dispatch(removeFavorite(movie.id));
        toast.success('Removed from favorites');
      } else {
        const res = await favoritesApi.add({
          movieId: movie.id,
          title: movie.title,
          posterUrl: getPosterUrl(movie.poster_path || movie.posterUrl) || '',
          releaseDate: movie.release_date,
          rating: movie.vote_average,
          genre: movie.genre || movie.genres?.map((g) => g.name) || [],
        });
        dispatch(addFavorite(res.data));
        toast.success('Added to favorites');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  if (loading || !movie) {
    return (
      <div className="min-h-screen">
        <LoaderSkeleton type="detail" />
      </div>
    );
  }

  const poster = getPosterUrl(movie.poster_path || movie.posterUrl) || PLACEHOLDER_POSTER;
  const backdrop = getBackdropUrl(movie.backdrop_path || movie.poster_path || movie.posterUrl);
  const description = movie.overview || DEFAULT_DESCRIPTION;
  const releaseDate = movie.release_date?.slice(0, 4) || movie.year || '';
  const rating = movie.vote_average ?? 0;
  const genres = (movie.genres?.map((g) => g.name) || movie.genre || []).join(', ') || '—';

  return (
    <div className="min-h-screen">
      <div className="relative h-[40vh] min-h-[300px]">
        {backdrop && (
          <img
            src={backdrop}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-cinema" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-32 relative z-10 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-8"
        >
          <div className="w-full md:w-80 flex-shrink-0">
            <img
              src={poster}
              alt={movie.title}
              className="w-full rounded-xl shadow-2xl aspect-[2/3] object-cover"
              onError={(e) => { e.target.src = PLACEHOLDER_POSTER; }}
            />
          </div>
          <div className="flex-1">
            <h1 className="font-sansation text-3xl md:text-4xl font-bold text-white mb-2">
              {movie.title}
            </h1>
            <p className="text-gray-400 mb-4">{releaseDate} · {genres}</p>
            {rating > 0 && (
              <div className="flex items-center gap-2 mb-6">
                <Icon icon="mdi:star" className="w-6 h-6 text-yellow-500" />
                <span className="text-xl font-medium">{rating.toFixed(1)}</span>
              </div>
            )}
            <p className="text-gray-300 leading-relaxed mb-6">{description}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/watch/${movie.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-red hover:bg-red-600 transition-colors font-medium"
              >
                <Icon icon="mdi:play" className="w-5 h-5" />
                Play Trailer
              </Link>
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleFavorite}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                    isFavorite ? 'bg-red-500/20 text-red-400' : 'glass hover:bg-white/10'
                  }`}
                >
                  <Icon icon={isFavorite ? 'mdi:heart' : 'mdi:heart-outline'} className="w-5 h-5" />
                  {isFavorite ? 'In Favorites' : 'Add to Favorites'}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
