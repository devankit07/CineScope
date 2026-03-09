import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleCommandPalette } from '@/redux/slices/uiSlice';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

const actions = (isAuth, isAdmin) => {
  const base = [
    { id: 'home', label: 'Home', path: '/', icon: 'mdi:home' },
    { id: 'movies', label: 'Movies', path: '/discover', icon: 'mdi:movie-open' },
    { id: 'shorts', label: 'Shorts', path: '/shorts', icon: 'mdi:filmstrip' },
  ];
  if (isAuth) {
    base.push(
      { id: 'favorites', label: 'Favorites', path: '/favorites', icon: 'mdi:heart' },
      { id: 'history', label: 'Watch History', path: '/history', icon: 'mdi:history' },
      { id: 'profile', label: 'Profile', path: '/profile', icon: 'mdi:account' }
    );
  }
  if (isAdmin) {
    base.push({ id: 'admin', label: 'Admin Dashboard', path: '/admin', icon: 'mdi:shield-account' });
  }
  if (!isAuth) {
    base.push(
      { id: 'login', label: 'Login', path: '/login', icon: 'mdi:login' },
      { id: 'signup', label: 'Sign Up', path: '/signup', icon: 'mdi:account-plus' }
    );
  }
  return base;
};

export default function CommandPalette() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const open = useSelector((s) => s.ui.commandPaletteOpen);
  const { isAuthenticated, user } = useAuth();
  const [selected, setSelected] = useState(0);
  const listRef = useRef([]);
  const isAdmin = user?.role === 'admin';
  const items = actions(isAuthenticated, isAdmin);

  useEffect(() => {
    listRef.current = items;
  }, [items.length, isAuthenticated, isAdmin]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        dispatch(toggleCommandPalette());
        setSelected(0);
      }
      if (!open) return;
      if (e.key === 'Escape') {
        dispatch(toggleCommandPalette(false));
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected((s) => (s + 1) % items.length);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected((s) => (s - 1 + items.length) % items.length);
      }
      if (e.key === 'Enter' && items[selected]) {
        e.preventDefault();
        navigate(items[selected].path);
        dispatch(toggleCommandPalette(false));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, items, selected, dispatch, navigate]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm"
        onClick={() => dispatch(toggleCommandPalette(false))}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-xl glass rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
            <Icon icon="mdi:magnify" className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400 text-sm">Quick navigation (↑↓ Enter)</span>
          </div>
          <ul className="max-h-80 overflow-y-auto py-2">
            {items.map((action, i) => (
              <li key={action.id}>
                <button
                  type="button"
                  onClick={() => {
                    navigate(action.path);
                    dispatch(toggleCommandPalette(false));
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                    i === selected ? 'bg-white/10' : 'hover:bg-white/5'
                  )}
                >
                  <Icon icon={action.icon} className="w-5 h-5 text-gray-400" />
                  <span>{action.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
