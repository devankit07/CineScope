import { motion } from 'framer-motion';
import MovieCard from './MovieCard';
import LoaderSkeleton from './LoaderSkeleton';

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

export default function MovieGrid({ movies, loading, title, subtitle }) {
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
        {movies.map((movie) => (
          <motion.div key={movie.id} variants={item}>
            <MovieCard movie={movie} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
