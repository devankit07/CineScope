import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import MovieCard from './MovieCard';
import LoaderSkeleton from './LoaderSkeleton';

const AUTO_ADVANCE_MS = 5000;
const SWIPE_THRESHOLD = 50;

export default function MovieWiper({ movies, loading, title, subtitle }) {
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const autoRef = useRef(null);

  const n = movies?.length ?? 0;
  const currentIndex = n ? ((index % n) + n) % n : 0;
  const currentMovie = n ? movies[currentIndex] : null;

  const goTo = useCallback(
    (next) => {
      if (n <= 0) return;
      setIndex((i) => (i + next + n) % n);
    },
    [n]
  );

  const goNext = useCallback(() => goTo(1), [goTo]);
  const goPrev = useCallback(() => goTo(-1), [goTo]);

  // Auto-advance
  useEffect(() => {
    if (n <= 1) return;
    autoRef.current = setInterval(goNext, AUTO_ADVANCE_MS);
    return () => {
      if (autoRef.current) clearInterval(autoRef.current);
    };
  }, [n, goNext]);

  // Reset auto timer on manual change
  const handleNav = (dir) => {
    goTo(dir);
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(goNext, AUTO_ADVANCE_MS);
  };

  // Touch swipe
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (touchStart == null || touchEnd == null) return;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) handleNav(1);
      else handleNav(-1);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (loading) {
    return (
      <section className="px-4 sm:px-6 py-8">
        {title && (
          <div className="mb-6">
            <h2 className="font-sansation text-2xl md:text-3xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
          </div>
        )}
        <div className="w-full max-w-sm mx-auto aspect-[2/3] rounded-xl overflow-hidden">
          <LoaderSkeleton />
        </div>
      </section>
    );
  }

  if (!movies?.length) {
    return (
      <section className="px-4 sm:px-6 py-8">
        {title && (
          <div className="mb-6">
            <h2 className="font-sansation text-2xl md:text-3xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
          </div>
        )}
        <p className="text-gray-400 text-center py-12">No movies to show.</p>
      </section>
    );
  }

  return (
    <section className="px-4 sm:px-6 py-8">
      {title && (
        <div className="mb-6">
          <h2 className="font-sansation text-2xl md:text-3xl font-bold text-white">{title}</h2>
          {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
        </div>
      )}

      <div
        className="relative w-full max-w-sm mx-auto select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            <MovieCard movie={currentMovie} layout="poster" />
          </motion.div>
        </AnimatePresence>

        {n > 1 && (
          <>
            <button
              type="button"
              onClick={() => handleNav(-1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white shadow-lg"
              aria-label="Previous"
            >
              <Icon icon="mdi:chevron-left" className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => handleNav(1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white shadow-lg"
              aria-label="Next"
            >
              <Icon icon="mdi:chevron-right" className="w-6 h-6" />
            </button>

            <div className="flex justify-center gap-1.5 mt-4">
              {movies.slice(0, Math.min(n, 10)).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setIndex(i);
                    if (autoRef.current) clearInterval(autoRef.current);
                    autoRef.current = setInterval(goNext, AUTO_ADVANCE_MS);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentIndex ? 'bg-accent-red w-4' : 'bg-white/40'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
