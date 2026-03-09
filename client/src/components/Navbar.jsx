import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '@/redux/slices/authSlice';
import { toggleCommandPalette } from '@/redux/slices/uiSlice';
import SearchBar from './SearchBar';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';

const SCROLL_THRESHOLD = 60;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setMenuOpen(false);
  };

  const openCommandPalette = () => {
    dispatch(toggleCommandPalette(true));
  };

  return (
    <nav
      className={cn(
        'fixed top-0 z-50 glass transition-all duration-300 ease-out',
        scrolled
          ? 'left-4 right-4 top-4 md:left-8 md:right-8 md:top-4 rounded-full border border-white/10 shadow-lg'
          : 'left-0 right-0 border-b border-white/5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Left: Logo + nav links */}
        <div className="flex items-center gap-6 md:gap-8">
          <Link to="/" className="flex items-center gap-2 text-xl font-sansation font-bold tracking-tight shrink-0">
            <span className="bg-gradient-to-r from-accent-red to-accent-gold bg-clip-text text-transparent">
              CineScope
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="nav-swipe text-gray-400 hover:text-white transition-colors">Home</Link>
            <Link to="/discover" className="nav-swipe text-gray-400 hover:text-white transition-colors">Movies</Link>
            <Link to="/shorts" className="nav-swipe text-gray-400 hover:text-white transition-colors">Shorts</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="nav-swipe text-gray-200 hover:text-white transition-colors">
                Dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl mx-6">
          <SearchBar onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} />
        </div>

        {/* Right: CP, Fav, Watch, Profile (icons) */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={openCommandPalette}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Command palette (Ctrl+K)"
          >
            <Icon icon="mdi:keyboard" className="w-5 h-5" />
          </button>
          {isAuthenticated ? (
            <>
              <Link
                to="/favorites"
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Favorites"
              >
                <Icon icon="mdi:heart" className="w-5 h-5" />
              </Link>
              <Link
                to="/history"
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Watch history"
              >
                <Icon icon="mdi:history" className="w-5 h-5" />
              </Link>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-accent-red/80 flex items-center justify-center text-sm font-medium">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                  <Icon icon="mdi:chevron-down" className={cn('w-4 h-4 transition-transform', menuOpen && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 top-full mt-1 py-2 w-56 rounded-xl shadow-xl bg-dark-800 border border-white/10 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-white/10 bg-dark-700/80">
                        <p className="font-medium truncate text-white">{user?.name}{user?.lastName ? ` ${user.lastName}` : ''}</p>
                        <p className="text-sm text-gray-300 truncate mt-0.5">{user?.email}</p>
                        <span className={user?.role === 'admin' ? 'inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded text-xs font-medium bg-accent-red/20 text-red-300' : 'inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-gray-300'}>
                          {user?.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="w-full px-4 py-2.5 text-left hover:bg-white/10 flex items-center gap-2 text-gray-200"
                      >
                        <Icon icon="mdi:account-edit-outline" className="w-4 h-4" />
                        Profile
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="w-full px-4 py-2.5 text-left hover:bg-white/10 flex items-center gap-2 text-gray-200"
                        >
                          <Icon icon="mdi:view-dashboard-outline" className="w-4 h-4" />
                          Dashboard
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 text-left hover:bg-white/10 flex items-center gap-2 text-gray-200"
                      >
                        <Icon icon="mdi:logout" className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-lg bg-accent-red hover:bg-red-600 transition-colors font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-white/10"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <Icon icon="mdi:menu" className="w-6 h-6" />
          </button>
        </div>
      </div>
      {searchFocused && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setSearchFocused(false)}
          aria-hidden
        />
      )}
    </nav>
  );
}
