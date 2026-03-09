import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import { tmdb, getPosterUrl } from '@/services/tmdb';
import { PLACEHOLDER_POSTER } from '@/utils/constants';
import { cn } from '@/utils/cn';

export default function SearchBar({ onFocus, onBlur, compact }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 500);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    tmdb
      .search(debouncedQuery, 1)
      .then((data) => {
        if (!cancelled) setResults((data.results ?? []).slice(0, 8));
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showDropdown = open && (query.trim() !== '' || results.length > 0);

  return (
    <div ref={containerRef} className={cn('relative w-full', compact && 'max-w-xs')}>
      <div className="relative flex items-center">
        <Icon icon="mdi:magnify" className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { setOpen(true); onFocus?.(); }}
          onBlur={() => onBlur?.()}
          placeholder="Search movies..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/30 outline-none transition-all text-white placeholder-gray-500"
        />
        {loading && (
          <Icon icon="mdi:loading" className="absolute right-3 w-5 h-5 text-gray-400 animate-spin" />
        )}
      </div>
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 right-0 mt-2 py-2 glass rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50"
          >
            {results.length === 0 && !loading ? (
              <p className="px-4 py-6 text-gray-400 text-center">No results for &quot;{query}&quot;</p>
            ) : (
              results.map((movie) => (
                <button
                  key={movie.id}
                  type="button"
                  onClick={() => {
                    navigate(`/movie/${movie.id || movie.imdbID}`);
                    setOpen(false);
                    setQuery('');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-left"
                >
                  <img
                    src={getPosterUrl(movie.poster_path || movie.posterUrl) || PLACEHOLDER_POSTER}
                    alt=""
                    className="w-12 h-16 object-cover rounded flex-shrink-0"
                    onError={(e) => { e.target.src = PLACEHOLDER_POSTER; }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{movie.title}</p>
                    {movie.release_date && (
                      <p className="text-sm text-gray-400">{movie.release_date.slice(0, 4)}</p>
                    )}
                  </div>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
