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

export default function ShortsFeed() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { clips, loading } = useSelector((s) => s.shorts);
  const [activeIndex, setActiveIndex] = useState(0);
  const viewRecordedRef = useRef(new Set());

  useEffect(() => {
    dispatch(setShortsLoading(true));
    shortsApi
      .getClips()
      .then((res) => dispatch(setClips(res.data)))
      .catch((err) => {
        dispatch(setClips([]));
        dispatch(setShortsError(err.response?.data?.message || 'Failed to load shorts'));
      })
      .finally(() => dispatch(setShortsLoading(false)));
  }, [dispatch]);

  const handleVisible = useCallback(
    (index) => {
      setActiveIndex(index);
      if (!isAuthenticated) return;
      const clip = clips[index];
      const movieId = clip?.movieId ?? clip?.id;
      if (movieId == null) return;
      if (viewRecordedRef.current.has(String(movieId))) return;
      viewRecordedRef.current.add(String(movieId));
      shortsApi.recordView(movieId).catch(() => {});
    },
    [clips, isAuthenticated]
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
        className="h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden snap-y snap-mandatory scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence initial={false}>
          {clips.map((clip, index) => (
            <section
              key={clip._id || clip.movieId || index}
              className="h-[calc(100vh-4rem)] w-full snap-start snap-always"
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
