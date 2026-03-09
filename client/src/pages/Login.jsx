import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { setCredentials } from '@/redux/slices/authSlice';
import { authApi } from '@/services/api';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email and password required');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      dispatch(setCredentials(data));
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass rounded-2xl p-8 shadow-2xl"
      >
        <h1 className="font-sansation text-2xl font-bold text-white mb-2">Sign in</h1>
        <p className="text-gray-400 mb-6">Welcome back to CineScope</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-accent-red/50 outline-none"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-accent-red/50 outline-none"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-accent-red hover:bg-red-600 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
          >
            {loading ? <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" /> : 'Login'}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-400">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-accent-red hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
