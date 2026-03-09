import { useState, useEffect, useRef, useCallback } from 'react';
import MovieCard from './MovieCard';
import LoaderSkeleton from './LoaderSkeleton';

/** Slow scroll speed in pixels per second */
const SCROLL_SPEED = 24;
const CARD_WIDTH = 180;
const GAP = 16;

export default function MovieCarousel({ movies, loading, title, subtitle }) {
  const [isPaused, setIsPaused] = useState(false);
  const offsetRef = useRef(0);
  const trackRef = useRef(null);
  const rafRef = useRef(null);
  const segmentWidthRef = useRef(0);

  const list = movies ?? [];
  const duplicated = list.length > 0 ? [...list, ...list] : [];
  const segmentWidth = list.length * CARD_WIDTH + (list.length - 1) * GAP;

  segmentWidthRef.current = segmentWidth;

  const animate = useCallback(() => {
    if (isPaused || list.length <= 0) {
      rafRef.current = requestAnimationFrame(animate);
      return;
    }
    offsetRef.current += (SCROLL_SPEED * 16) / 1000;
    if (offsetRef.current >= segmentWidthRef.current) {
      offsetRef.current -= segmentWidthRef.current;
    }
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
    }
    rafRef.current = requestAnimationFrame(animate);
  }, [isPaused, list.length]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  if (loading) {
    return (
      <section className="px-4 sm:px-6 py-8">
        {title && (
          <div className="mb-6">
            <h2 className="font-sansation text-2xl md:text-3xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
          </div>
        )}
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex-shrink-0" style={{ width: CARD_WIDTH }}>
              <LoaderSkeleton />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!list.length) {
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
        className="overflow-hidden select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          ref={trackRef}
          className="flex gap-4 w-max"
          style={{ width: duplicated.length * (CARD_WIDTH + GAP) - GAP }}
        >
          {duplicated.map((movie, i) => (
            <div
              key={`${movie.id}-${i}`}
              className="flex-shrink-0"
              style={{ width: CARD_WIDTH }}
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
