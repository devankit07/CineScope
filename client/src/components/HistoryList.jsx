import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { PLACEHOLDER_POSTER } from '@/utils/constants';

export default function HistoryList({ items, loading, onRemove }) {
  if (loading) {
    return (
      <div className="space-y-4 px-4 sm:px-6 py-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 rounded-xl bg-dark-800 animate-pulse">
            <div className="w-20 h-28 rounded bg-dark-600 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-1/2 bg-dark-600 rounded" />
              <div className="h-4 w-1/4 bg-dark-600 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (!items?.length) {
    return (
      <div className="px-4 sm:px-6 py-16 text-center">
        <p className="text-gray-400 text-lg">No watch history yet.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4 px-4 sm:px-6 py-8">
      {items.map((h, i) => (
        <motion.div
          key={`${h.movieId}-${h.lastWatchedAt}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex gap-4 p-4 rounded-xl glass hover:bg-white/5 transition-colors group"
        >
          <Link to={`/movie/${h.movieId}`} className="flex gap-4 flex-1 min-w-0">
            <img
              src={h.posterUrl || PLACEHOLDER_POSTER}
              alt=""
              className="w-20 h-28 object-cover rounded flex-shrink-0"
              onError={(e) => { e.target.src = PLACEHOLDER_POSTER; }}
            />
            <div className="min-w-0 flex-1">
              <p className="font-sansation font-semibold text-white truncate">{h.title || 'Movie'}</p>
              <p className="text-sm text-gray-400">
                {h.progress > 0 && h.duration > 0
                  ? `${Math.round((h.progress / h.duration) * 100)}% watched`
                  : 'Viewed'}
              </p>
            </div>
          </Link>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(h.movieId)}
              className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
              title="Remove from history"
            >
              <Icon icon="mdi:close" className="w-5 h-5" />
            </button>
          )}
        </motion.div>
      ))}
    </div>
  );
}
