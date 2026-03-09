import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useAuth } from '@/hooks/useAuth';
import { commentsApi } from '@/services/api';
import toast from 'react-hot-toast';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return d.toLocaleDateString();
}

export default function CommentsSection({ movieId }) {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!movieId) return;
    commentsApi
      .getByMovie(movieId)
      .then((res) => setComments(res.data || []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [movieId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !isAuthenticated) {
      if (!isAuthenticated) toast.error('Sign in to comment');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await commentsApi.add(movieId, trimmed);
      setComments((prev) => [data, ...prev]);
      setText('');
      toast.success('Comment added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId, isOwnerOrAdmin) => {
    if (!isOwnerOrAdmin) return;
    try {
      await commentsApi.delete(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment removed');
    } catch {
      toast.error('Could not delete comment');
    }
  };

  const currentUserId = user?.id || user?._id;

  return (
    <div className="mt-8 p-4 rounded-xl bg-dark-800/80 border border-white/5">
      <h2 className="font-sansation font-semibold text-white mb-1 flex items-center gap-2">
        <Icon icon="mdi:comment-multiple-outline" className="w-5 h-5" />
        Comments
        {comments.length > 0 && (
          <span className="text-gray-400 font-normal text-sm">({comments.length})</span>
        )}
      </h2>

      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            maxLength={2000}
            className="flex-1 px-4 py-3 rounded-lg bg-dark-700 border border-white/10 text-white placeholder-gray-500 focus:border-accent-red/50 outline-none"
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="px-5 py-3 rounded-lg bg-accent-red hover:bg-red-600 disabled:opacity-50 font-medium shrink-0"
          >
            {submitting ? '…' : 'Comment'}
          </button>
        </form>
      )}

      {!isAuthenticated && (
        <p className="text-gray-500 text-sm mt-3">Sign in to leave a comment.</p>
      )}

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-gray-500 text-sm">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
        ) : (
          comments.map((c) => {
            const isOwner = String(c.userId) === String(currentUserId);
            const isAdmin = user?.role === 'admin';
            const canDelete = isOwner || isAdmin;
            return (
              <div
                key={c._id}
                className="flex gap-3 py-3 border-b border-white/5 last:border-0"
              >
                <div className="w-8 h-8 rounded-full bg-accent-red/30 flex items-center justify-center text-accent-red font-medium shrink-0">
                  {(c.userName || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white">{c.userName || 'User'}</span>
                    <span className="text-gray-500 text-xs">{formatDate(c.createdAt)}</span>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(c._id, canDelete)}
                        className="text-gray-500 hover:text-red-400 text-xs"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm mt-0.5 whitespace-pre-wrap break-words">
                    {c.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
