import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFavorites, setFavoritesLoading } from '@/redux/slices/favoritesSlice';
import { favoritesApi } from '@/services/api';
import FavoritesGrid from '@/components/FavoritesGrid';
import { useAuth } from '@/hooks/useAuth';

export default function Favorites() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { items, loading } = useSelector((s) => s.favorites);

  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(setFavoritesLoading(true));
    favoritesApi
      .get()
      .then((res) => dispatch(setFavorites(res.data)))
      .catch(() => dispatch(setFavorites([])))
      .finally(() => dispatch(setFavoritesLoading(false)));
  }, [isAuthenticated, dispatch]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="px-4 sm:px-6 py-8">
        <h1 className="font-sansation text-3xl font-bold text-white mb-2">My Favorites</h1>
        <p className="text-gray-400">Movies you&apos;ve added to your list</p>
      </div>
      <FavoritesGrid items={items} loading={loading} />
    </div>
  );
}
