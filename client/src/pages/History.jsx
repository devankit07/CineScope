import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setHistory, setHistoryLoading, removeFromHistory } from '@/redux/slices/historySlice';
import { historyApi } from '@/services/api';
import HistoryList from '@/components/HistoryList';
import { useAuth } from '@/hooks/useAuth';

export default function History() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { items, loading } = useSelector((s) => s.history);

  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(setHistoryLoading(true));
    historyApi
      .get()
      .then((res) => dispatch(setHistory(res.data)))
      .catch(() => dispatch(setHistory([])))
      .finally(() => dispatch(setHistoryLoading(false)));
  }, [isAuthenticated, dispatch]);

  const handleRemove = (movieId) => {
    historyApi.remove(movieId).catch(() => {});
    dispatch(removeFromHistory(movieId));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="px-4 sm:px-6 py-8">
        <h1 className="font-sansation text-3xl font-bold text-white mb-2">Watch History</h1>
        <p className="text-gray-400">Continue watching and recent views</p>
      </div>
      <HistoryList items={items} loading={loading} onRemove={handleRemove} />
    </div>
  );
}
