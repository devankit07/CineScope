import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import ShortActions from './ShortActions';
import { PLACEHOLDER_POSTER } from '@/utils/constants';
import { useAuth } from '@/hooks/useAuth';

export default function ShortVideoCard({
  clip,
  index,
  isActive,
  onVisible,
  onLike,
  onSave,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const { isAuthenticated, user } = useAuth();
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const movieId = clip?.movieId ?? clip?.id;
  const title = clip?.title ?? '';
  const genre = clip?.genre ?? '';
  const poster = clip?.poster || PLACEHOLDER_POSTER;
  const videoUrl = clip?.videoUrl || '';

  const hasVideo = videoUrl && !videoError;
  const isLiked = isAuthenticated && (user?.likedClips || []).map(String).includes(String(movieId));
  const isSaved = isAuthenticated && (user?.watchLater || []).map(String).includes(String(movieId));

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onVisible?.(index);
          }
        });
      },
      { threshold: 0.5, rootMargin: '0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index, onVisible]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive && hasVideo) {
      if (video.src !== videoUrl) {
        video.src = videoUrl;
        video.load();
      }
      video.play().catch(() => setVideoError(true));
    } else {
      video.pause();
    }
  }, [isActive, hasVideo, videoUrl]);

  const handleLoadedData = useCallback(() => setVideoLoaded(true), []);
  const handleError = useCallback(() => setVideoError(true), []);

  return (
    <motion.div
      ref={containerRef}
      className="h-full w-full flex-shrink-0 snap-start snap-always relative overflow-hidden bg-dark-900"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {hasVideo ? (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          loop
          playsInline
          preload="none"
          onLoadedData={handleLoadedData}
          onError={handleError}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-800 p-6 text-center">
          <img
            src={poster}
            alt=""
            className="max-h-[50vh] w-auto rounded-lg shadow-2xl object-contain mb-4"
            onError={(e) => {
              e.target.src = PLACEHOLDER_POSTER;
            }}
          />
          <p className="text-gray-400 font-medium">Preview unavailable</p>
          <p className="text-sm text-gray-500 mt-1">Trailer or clip not available for this title</p>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      <div className="absolute left-0 right-20 bottom-4 md:bottom-6 px-4 md:px-6 pt-16 pointer-events-none">
        <motion.h2
          className="font-sansation text-xl md:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg line-clamp-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {title}
        </motion.h2>
        {genre && (
          <motion.p
            className="text-gray-300 text-sm md:text-base mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            {genre}
          </motion.p>
        )}
      </div>

      <ShortActions
        movieId={movieId}
        isLiked={isLiked}
        isSaved={isSaved}
        onLike={() => onLike?.(movieId, isLiked)}
        onSave={() => onSave?.(movieId, isSaved)}
        isAuthenticated={isAuthenticated}
      />
    </motion.div>
  );
}
