import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

const btnVariants = {
  tap: { scale: 0.92 },
  hover: { scale: 1.08 },
};

export default function ShortActions({
  movieId,
  isLiked,
  isSaved,
  onLike,
  onSave,
  isAuthenticated,
}) {
  return (
    <div className="absolute right-2 md:right-4 bottom-24 md:bottom-28 flex flex-col items-center gap-4 z-20">
      <motion.button
        type="button"
        onClick={isAuthenticated ? onLike : undefined}
        variants={btnVariants}
        whileTap="tap"
        whileHover="hover"
        className="flex flex-col items-center gap-1 text-white/90 hover:text-white"
        title={isAuthenticated ? (isLiked ? 'Unlike' : 'Like') : 'Login to like'}
      >
        <span className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm border border-white/10">
          <Icon
            icon={isLiked ? 'mdi:heart' : 'mdi:heart-outline'}
            className={`w-6 h-6 ${isLiked ? 'text-accent-red' : ''}`}
          />
        </span>
        <span className="text-xs font-medium">Like</span>
      </motion.button>

      <motion.button
        type="button"
        onClick={isAuthenticated ? onSave : undefined}
        variants={btnVariants}
        whileTap="tap"
        whileHover="hover"
        className="flex flex-col items-center gap-1 text-white/90 hover:text-white"
        title={isAuthenticated ? (isSaved ? 'Unsave' : 'Save') : 'Login to save'}
      >
        <span className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm border border-white/10">
          <Icon
            icon={isSaved ? 'mdi:bookmark' : 'mdi:bookmark-outline'}
            className={`w-6 h-6 ${isSaved ? 'text-accent-gold' : ''}`}
          />
        </span>
        <span className="text-xs font-medium">Save</span>
      </motion.button>

      <motion.div variants={btnVariants} whileTap="tap" whileHover="hover">
        <Link
          to={`/movie/${movieId}`}
          className="flex flex-col items-center gap-1 text-white/90 hover:text-white"
          title="View movie"
        >
          <span className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm border border-white/10">
            <Icon icon="mdi:movie-open-outline" className="w-6 h-6" />
          </span>
          <span className="text-xs font-medium">Movie</span>
        </Link>
      </motion.div>
    </div>
  );
}
