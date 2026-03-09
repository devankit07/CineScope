import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { closeTrailerModal } from '@/redux/slices/uiSlice';
import { addToHistory } from '@/redux/slices/historySlice';
import { historyApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { getYouTubeEmbedUrl } from '@/services/omdb';
import { TRAILER_UNAVAILABLE } from '@/utils/constants';

export default function TrailerModal() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { open, movieId, key: propKey, title, posterUrl } = useSelector((s) => s.ui.trailerModal);
  const [key, setKey] = useState(propKey);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open || !movieId) return;
    setLoading(true);
    setError(false);
    if (isAuthenticated) {
      historyApi.add({ movieId, title: title || '', posterUrl: posterUrl || '' }).catch(() => {});
      dispatch(addToHistory({ movieId, title: title || '', posterUrl: posterUrl || '' }));
    }
    if (propKey) {
      setKey(propKey);
      setLoading(false);
      return;
    }
    // OMDB does not provide trailer/video links — show unavailable
    setError(true);
    setLoading(false);
  }, [open, movieId, propKey]);

  const embedUrl = getYouTubeEmbedUrl(key);

  const handleClose = () => {
    dispatch(closeTrailerModal());
    setKey(null);
    setError(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative w-full max-w-4xl aspect-video bg-dark-800 rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
            >
              <Icon icon="mdi:close" className="w-6 h-6" />
            </button>
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon icon="mdi:loading" className="w-12 h-12 text-white animate-spin" />
              </div>
            ) : error || !embedUrl ? (
              <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                <p className="text-gray-300 text-lg">{TRAILER_UNAVAILABLE}</p>
              </div>
            ) : (
              <iframe
                src={embedUrl}
                title="Trailer"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
