import { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import ShortVideoCard from './ShortVideoCard';
import ShortSkeletonLoader from './ShortSkeletonLoader';
import ShortNavigation from './ShortNavigation';
import { shortsApi } from '@/services/api';
import { setClips, setShortsLoading, setShortsError } from '@/redux/slices/shortsSlice';
import { updateUser } from '@/redux/slices/authSlice';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { tmdb, getPosterUrl } from '@/services/tmdb';

const TMDB_GENRE_MAP = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance',
  878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

function tmdbMoviesToClips(movies) {
  return movies.map((m) => ({
    movieId: m.id,
    title: m.title,
    poster: getPosterUrl(m.poster_path),
    genre: (m.genre_ids || []).slice(0, 2).map((id) => TMDB_GENRE_MAP[id]).filter(Boolean).join(' • '),
    videoUrl: '',
  }));
}

export default function ShortsFeed() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { clips, loading } = useSelector((s) => s.shorts);
  const [activeIndex, setActiveIndex] = useState(0);
  const viewRecordedRef = useRef(new Set());
  const scrollRef = useRef(null);
  const isResettingRef = useRef(false);
  const n = clips.length;

  // Display clips twice for seamless loop (infinite feed)
  const displayClips = n > 0 ? [...clips, ...clips] : [];

  useEffect(() => {
    dispatch(setShortsLoading(true));
    shortsApi
      .getClips()
      .then(async (res) => {
        const dbClips = Array.isArray(res.data) ? res.data : [];
        if (dbClips.length > 0) {
          dispatch(setClips(dbClips));
        } else {
          // No admin clips → fall back to TMDB trending movies as shorts
          const [trending, popular] = await Promise.all([
            tmdb.getTrending(1),
            tmdb.getPopular(1),
          ]);
          const movies = [
            ...(trending?.results || []),
            ...(popular?.results || []),
          ];
          // Deduplicate by id
          const seen = new Set();
          const unique = movies.filter((m) => {
            if (seen.has(m.id)) return false;
            seen.add(m.id);
            return true;
          });
          dispatch(setClips(tmdbMoviesToClips(unique.slice(0, 20))));
        }
      })
      .catch(async () => {
        // API down → still try TMDB
        try {
          const trending = await tmdb.getTrending(1);
          dispatch(setClips(tmdbMoviesToClips((trending?.results || []).slice(0, 20))));
        } catch {
          dispatch(setClips([]));
          dispatch(setShortsError('Failed to load shorts'));
        }
      })
      .finally(() => dispatch(setShortsLoading(false)));
  }, [dispatch]);

  // When user scrolls past the end of the second set, reset to start (infinite loop)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || n === 0) return;
    const onScroll = () => {
      if (isResettingRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 2;
      if (atBottom) {
        isResettingRef.current = true;
        el.style.scrollBehavior = 'auto';
        el.scrollTop = 0;
        requestAnimationFrame(() => {
          el.style.scrollBehavior = 'smooth';
          isResettingRef.current = false;
          setActiveIndex(0);
        });
      }
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [n]);

  const handleVisible = useCallback(
    (index) => {
      setActiveIndex(index);
      if (!isAuthenticated) return;
      const clip = clips[index % n];
      const movieId = clip?.movieId ?? clip?.id;
      if (movieId == null) return;
      if (viewRecordedRef.current.has(String(movieId))) return;
      viewRecordedRef.current.add(String(movieId));
      shortsApi.recordView(movieId).catch(() => {});
    },
    [clips, n, isAuthenticated]
  );

  const handleLike = useCallback(
    async (movieId, isCurrentlyLiked) => {
      if (!isAuthenticated) {
        toast.error('Login to like clips');
        return;
      }
      try {
        const res = isCurrentlyLiked
          ? await shortsApi.unlike(movieId)
          : await shortsApi.like(movieId);
        if (res.data?.likedClips != null) dispatch(updateUser({ likedClips: res.data.likedClips }));
        if (!isCurrentlyLiked) toast.success('Liked');
      } catch {
        toast.error('Could not update like');
      }
    },
    [isAuthenticated, dispatch]
  );

  const handleSave = useCallback(
    async (movieId, isCurrentlySaved) => {
      if (!isAuthenticated) {
        toast.error('Login to save for later');
        return;
      }
      try {
        const res = isCurrentlySaved
          ? await shortsApi.unsave(movieId)
          : await shortsApi.save(movieId);
        if (res.data?.watchLater != null) dispatch(updateUser({ watchLater: res.data.watchLater }));
        if (!isCurrentlySaved) toast.success('Saved to watch later');
      } catch {
        toast.error('Could not save');
      }
    },
    [isAuthenticated, dispatch]
  );

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <ShortSkeletonLoader />
      </div>
    );
  }

  if (!clips.length) {
    return (
      <>
        <ShortNavigation />
        <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4 px-4">
          <p className="text-gray-400 text-center">No clips yet.</p>
          <p className="text-sm text-gray-500 text-center">
            Add movie preview clips from the admin dashboard or run the seed script.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <ShortNavigation />
      <div
        ref={scrollRef}
        className="h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden snap-y snap-mandatory scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence initial={false}>
          {displayClips.map((clip, index) => (
            <section
              key={`${clip._id || clip.movieId}-${index}`}
              className="h-[calc(100vh-4rem)] w-full flex-shrink-0 snap-start snap-always"
            >
              <ShortVideoCard
                clip={clip}
                index={index}
                isActive={index === activeIndex}
                onVisible={handleVisible}
                onLike={handleLike}
                onSave={handleSave}
              />
            </section>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
