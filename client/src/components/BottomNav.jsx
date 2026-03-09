import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Icon } from '@iconify/react';
import { useAuth } from '@/hooks/useAuth';
import { toggleCommandPalette } from '@/redux/slices/uiSlice';

const routeItems = [
  { to: '/', label: 'Home', icon: 'mdi:home' },
  { to: '/discover', label: 'Movies', icon: 'mdi:movie-open' },
  { to: '/shorts', label: 'Shorts', icon: 'mdi:filmstrip' },
  { action: 'command', label: 'Search', icon: 'mdi:keyboard' },
  { to: '/admin', label: 'Dashboard', icon: 'mdi:view-dashboard', adminOnly: true },
];

export default function BottomNav() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const items = routeItems.filter((item) => !item.adminOnly || user?.role === 'admin');

  const openCommandPalette = () => dispatch(toggleCommandPalette(true));

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden py-2 px-2"
      style={{
        background: 'rgba(18, 18, 24, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="flex items-center justify-around">
        {items.map((item) =>
          item.action === 'command' ? (
            <button
              key="command"
              type="button"
              onClick={openCommandPalette}
              className="flex flex-col items-center gap-1 py-1 px-3 rounded-lg min-w-[64px] transition-colors text-gray-400 hover:text-white"
              title="Command palette (Ctrl+K)"
            >
              <Icon icon={item.icon} className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-3 rounded-lg min-w-[64px] transition-colors ${
                  isActive ? 'text-accent-red' : 'text-gray-400'
                }`
              }
            >
              <Icon icon={item.icon} className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          )
        )}
      </div>
    </nav>
  );
}
