import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import MovieCard from './MovieCard';
import LoaderSkeleton from './LoaderSkeleton';

const MOBILE_BREAKPOINT = 768;
const MOBILE_COLS = 2;
const MOBILE_ROWS = 2;
const MOBILE_PAGE_SIZE = MOBILE_COLS * MOBILE_ROWS;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);
  return isMobile;
}

export default function MovieGrid({ movies, loading, title, subtitle, mobilePaginated = false }) {
  const isMobile = useIsMobile();
  const [page, setPage] = useState(0);

  const useMobilePagination = mobilePaginated && isMobile && movies?.length > MOBILE_PAGE_SIZE;
  const displayedMovies = useMobilePagination
    ? movies.slice(page * MOBILE_PAGE_SIZE, page * MOBILE_PAGE_SIZE + MOBILE_PAGE_SIZE)
    : movies;
  const totalPages = useMobilePagination ? Math.ceil(movies.length / MOBILE_PAGE_SIZE) : 1;

  useEffect(() => {
    setPage(0);
  }, [movies?.length, useMobilePagination]);

  if (loading) {
    return (
      <section className="px-4 sm:px-6 py-8">
        {title && (
          <div className="mb-6">
            <h2 className="font-sansation text-2xl md:text-3xl font-bold text-white">{title}</h2>
            {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <LoaderSkeleton key={i} />
          ))}
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
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
      >
        {displayedMovies.map((movie) => (
          <motion.div key={movie.id} variants={item}>
            <MovieCard movie={movie} />
          </motion.div>
        ))}
      </motion.div>
      {useMobilePagination && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2 rounded-full bg-white/10 disabled:opacity-40 disabled:pointer-events-none text-white"
            aria-label="Previous page"
          >
            <Icon icon="mdi:chevron-left" className="w-5 h-5" />
          </button>
          <span className="text-gray-400 text-sm min-w-[4rem] text-center">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-2 rounded-full bg-white/10 disabled:opacity-40 disabled:pointer-events-none text-white"
            aria-label="Next page"
          >
            <Icon icon="mdi:chevron-right" className="w-5 h-5" />
          </button>
        </div>
      )}
    </section>
  );
}
