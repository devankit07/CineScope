import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { omdb, getPosterUrl } from '@/services/omdb';
import { PLACEHOLDER_POSTER, TRAILER_UNAVAILABLE } from '@/utils/constants';
import { addToHistory } from '@/redux/slices/historySlice';
import { addFavorite, removeFavorite } from '@/redux/slices/favoritesSlice';
import { historyApi, favoritesApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import LoaderSkeleton from '@/components/LoaderSkeleton';
import CommentsSection from '@/components/CommentsSection';

export default function Watch() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const favoriteItems = useSelector((s) => s.favorites.items);
  const isFavorite = favoriteItems.some((f) => String(f.movieId) === String(id));

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    omdb
      .getById(id)
      .then((data) => {
        if (!cancelled) setMovie(data);
      })
      .catch(() => { if (!cancelled) setMovie(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

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

  useEffect(() => {
    if (!movie) return;
    const query = (movie.genre && movie.genre[0]) || movie.title || 'movie';
    omdb.search(query, 1)
      .then((d) => {
        const list = (d.results || []).filter((m) => String(m.id) !== String(id)).slice(0, 12);
        setRecommendations(list);
      })
      .catch(() => setRecommendations([]));
  }, [movie, id]);

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Sign in to add favorites');
      return;
    }
    try {
      if (isFavorite) {
        await favoritesApi.remove(id);
        dispatch(removeFavorite(id));
        toast.success('Removed from favorites');
      } else {
        const res = await favoritesApi.add({
          movieId: movie.id,
          title: movie.title,
          posterUrl: getPosterUrl(movie.poster_path || movie.posterUrl) || '',
          releaseDate: movie.release_date,
          rating: movie.vote_average,
          genre: movie.genre || [],
        });
        dispatch(addFavorite(res.data));
        toast.success('Added to favorites');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: movie?.title, url }).catch(() => copyAndToast(url));
    } else {
      copyAndToast(url);
    }
  };

  const copyAndToast = (url) => {
    navigator.clipboard?.writeText(url).then(() => toast.success('Link copied'));
  };

  if (loading || !movie) {
    return (
      <div className="min-h-screen pt-16">
        <LoaderSkeleton type="detail" />
      </div>
    );
  }

  const poster = getPosterUrl(movie.poster_path || movie.posterUrl) || PLACEHOLDER_POSTER;
  const genres = (movie.genres?.map((g) => g.name) || movie.genre || []).join(', ') || '—';
  const year = movie.release_date?.slice(0, 4) || movie.year || '';

  return (
    <div className="min-h-screen pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Video + info + actions */}
          <div className="flex-1 min-w-0">
            {/* Video area — OMDB has no trailer; show poster + message */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-dark-800 border border-white/10">
              <img
                src={poster}
                alt=""
                className="absolute inset-0 w-full h-full object-contain"
                onError={(e) => { e.target.src = PLACEHOLDER_POSTER; }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-6 text-center">
                <p className="text-gray-300 text-lg mb-2">{TRAILER_UNAVAILABLE}</p>
                <Link
                  to={`/movie/${id}`}
                  className="text-accent-red hover:underline font-medium"
                >
                  View movie details
                </Link>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-sansation text-2xl md:text-3xl font-bold text-white mt-4">
              {movie.title}
            </h1>
            <p className="text-gray-400 mt-1">{year} · {genres}</p>

            {/* Action buttons: Like, Save, Share */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button
                type="button"
                onClick={handleFavorite}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-colors ${
                  isFavorite ? 'bg-red-500/20 text-red-400' : 'glass hover:bg-white/10 text-gray-300'
                }`}
              >
                <Icon icon={isFavorite ? 'mdi:heart' : 'mdi:heart-outline'} className="w-5 h-5" />
                {isFavorite ? 'Saved' : 'Like'}
              </button>
              <Link
                to="/favorites"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full glass hover:bg-white/10 text-gray-300 font-medium transition-colors"
              >
                <Icon icon="mdi:bookmark-outline" className="w-5 h-5" />
                Save to watch later
              </Link>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full glass hover:bg-white/10 text-gray-300 font-medium transition-colors"
              >
                <Icon icon="mdi:share-variant" className="w-5 h-5" />
                Share
              </button>
            </div>

            {/* Description */}
            {movie.overview && (
              <div className="mt-6 p-4 rounded-xl bg-dark-800/80 border border-white/5">
                <h2 className="font-sansation font-semibold text-white mb-2">About</h2>
                <p className="text-gray-300 text-sm leading-relaxed">{movie.overview}</p>
              </div>
            )}

            {/* Comments */}
            <CommentsSection movieId={id} />
          </div>

          {/* Right: Recommended */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <h2 className="font-sansation text-lg font-bold text-white mb-4">Recommended</h2>
            <div className="space-y-3">
              {recommendations.length === 0 && (
                <p className="text-gray-500 text-sm">Loading recommendations...</p>
              )}
              {recommendations.map((rec) => (
                <Link key={rec.id} to={`/watch/${rec.id}`} className="block">
                  <div className="flex gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <img
                      src={getPosterUrl(rec.poster_path || rec.posterUrl) || PLACEHOLDER_POSTER}
                      alt=""
                      className="w-24 h-36 rounded object-cover flex-shrink-0"
                      onError={(e) => { e.target.src = PLACEHOLDER_POSTER; }}
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-white truncate">{rec.title}</h3>
                      <p className="text-gray-400 text-sm">
                        {rec.release_date?.slice(0, 4) || rec.year || ''}
                      </p>
                      {rec.vote_average > 0 && (
                        <p className="text-yellow-500 text-sm flex items-center gap-1 mt-0.5">
                          <Icon icon="mdi:star" className="w-4 h-4" />
                          {rec.vote_average.toFixed(1)}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
