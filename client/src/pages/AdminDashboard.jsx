import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { adminApi } from '@/services/api';
import toast from 'react-hot-toast';

const emptyMovie = {
  title: '',
  posterUrl: '',
  description: '',
  movieId: '',
  releaseDate: '',
  trailerYouTubeLink: '',
  genre: [],
  category: 'custom',
};

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [movies, setMovies] = useState([]);
  const [tab, setTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [editingMovie, setEditingMovie] = useState(null);
  const [form, setForm] = useState(emptyMovie);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingTrailer, setUploadingTrailer] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([adminApi.getUsers(), adminApi.getMovies()])
      .then(([u, m]) => {
        setUsers(u.data);
        setMovies(m.data);
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const handleBan = (id) => {
    adminApi.banUser(id).then(() => { load(); toast.success('User banned'); }).catch(() => toast.error('Failed'));
  };
  const handleUnban = (id) => {
    adminApi.unbanUser(id).then(() => { load(); toast.success('User unbanned'); }).catch(() => toast.error('Failed'));
  };
  const handleDeleteUser = (id) => {
    if (!confirm('Delete this user?')) return;
    adminApi.deleteUser(id).then(() => { load(); toast.success('Deleted'); }).catch(() => toast.error('Failed'));
  };
  const handleSetRole = (id, role) => {
    adminApi.setUserRole(id, role).then(() => {
      load();
      toast.success(`User role changed to ${role}`);
    }).catch((err) => toast.error(err?.response?.data?.message || 'Failed'));
  };

  const handleAddMovie = (e) => {
    e.preventDefault();
    const payload = { ...form, movieId: String(form.movieId).trim(), genre: Array.isArray(form.genre) ? form.genre : [] };
    if (!payload.title || !payload.movieId) return toast.error('Title and movieId required');
    adminApi.addMovie(payload).then(() => { setForm(emptyMovie); load(); toast.success('Movie added'); }).catch(() => toast.error('Failed'));
  };
  const handleEditMovie = (m) => {
    setEditingMovie(m._id);
    setForm({
      title: m.title,
      posterUrl: m.posterUrl || '',
      description: m.description || '',
      movieId: String(m.movieId),
      releaseDate: m.releaseDate || '',
      trailerYouTubeLink: m.trailerYouTubeLink || '',
      genre: m.genre || [],
      category: m.category || 'custom',
    });
  };
  const handleUpdateMovie = (e) => {
    e.preventDefault();
    if (!editingMovie) return;
    adminApi.editMovie(editingMovie, form).then(() => { setEditingMovie(null); setForm(emptyMovie); load(); toast.success('Updated'); }).catch(() => toast.error('Failed'));
  };
  const handleDeleteMovie = (id) => {
    if (!confirm('Delete this movie?')) return;
    adminApi.deleteMovie(id).then(() => { load(); toast.success('Deleted'); }).catch(() => toast.error('Failed'));
  };

  const handleUploadPoster = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPoster(true);
    adminApi.upload(file, 'image')
      .then((res) => { setForm((f) => ({ ...f, posterUrl: res.data.url })); toast.success('Poster uploaded'); })
      .catch(() => toast.error('Upload failed'))
      .finally(() => { setUploadingPoster(false); e.target.value = ''; });
  };

  const handleUploadTrailer = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingTrailer(true);
    adminApi.upload(file, 'video')
      .then((res) => { setForm((f) => ({ ...f, trailerYouTubeLink: res.data.url })); toast.success('Video uploaded'); })
      .catch(() => toast.error('Upload failed'))
      .finally(() => { setUploadingTrailer(false); e.target.value = ''; });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-sansation text-3xl font-bold text-white mb-6">Admin Dashboard</h1>
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setTab('users')}
          className={`px-4 py-2 rounded-lg font-medium ${tab === 'users' ? 'bg-accent-red' : 'glass'}`}
        >
          Users
        </button>
        <button
          type="button"
          onClick={() => setTab('movies')}
          className={`px-4 py-2 rounded-lg font-medium ${tab === 'movies' ? 'bg-accent-red' : 'glass'}`}
        >
          Movies
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : tab === 'users' ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto glass rounded-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 font-sansation">Name</th>
                <th className="p-4 font-sansation">Email</th>
                <th className="p-4 font-sansation">Role</th>
                <th className="p-4 font-sansation">Status</th>
                <th className="p-4 font-sansation">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-white/5">
                  <td className="p-4">{u.name}</td>
                  <td className="p-4 text-gray-400">{u.email}</td>
                  <td className="p-4">{u.role}</td>
                  <td className="p-4">{u.isBanned ? 'Banned' : 'Active'}</td>
                  <td className="p-4 flex gap-2 flex-wrap">
                    {u.role === 'admin' ? (
                      <button type="button" onClick={() => handleSetRole(u._id, 'user')} className="text-blue-400 hover:underline">Make User</button>
                    ) : (
                      <button type="button" onClick={() => handleSetRole(u._id, 'admin')} className="text-purple-400 hover:underline">Make Admin</button>
                    )}
                    {u.isBanned ? (
                      <button type="button" onClick={() => handleUnban(u._id)} className="text-green-400 hover:underline">Unban</button>
                    ) : (
                      <button type="button" onClick={() => handleBan(u._id)} className="text-amber-400 hover:underline">Ban</button>
                    )}
                    <button type="button" onClick={() => handleDeleteUser(u._id)} className="text-red-400 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <form onSubmit={editingMovie ? handleUpdateMovie : handleAddMovie} className="glass rounded-xl p-6 space-y-4">
            <h2 className="font-sansation text-xl">{editingMovie ? 'Edit Movie' : 'Add Movie'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white" />
              <input type="text" placeholder="Movie ID (TMDB/IMDb/custom)" value={form.movieId} onChange={(e) => setForm((f) => ({ ...f, movieId: e.target.value }))} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white" />
              <div className="md:col-span-2 flex gap-2 flex-wrap items-center">
                <input type="text" placeholder="Poster URL" value={form.posterUrl} onChange={(e) => setForm((f) => ({ ...f, posterUrl: e.target.value }))} className="flex-1 min-w-0 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white" />
                <label className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 cursor-pointer text-sm whitespace-nowrap flex items-center gap-2">
                  <Icon icon={uploadingPoster ? 'mdi:loading' : 'mdi:cloud-upload'} className={uploadingPoster ? 'animate-spin' : ''} />
                  {uploadingPoster ? 'Uploading…' : 'Upload poster'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleUploadPoster} disabled={uploadingPoster} />
                </label>
              </div>
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white md:col-span-2" />
              <input type="text" placeholder="Release date" value={form.releaseDate} onChange={(e) => setForm((f) => ({ ...f, releaseDate: e.target.value }))} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white" />
              <div className="flex gap-2 flex-wrap items-center">
                <input type="text" placeholder="Trailer URL or YouTube key" value={form.trailerYouTubeLink} onChange={(e) => setForm((f) => ({ ...f, trailerYouTubeLink: e.target.value }))} className="flex-1 min-w-0 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white" />
                <label className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 cursor-pointer text-sm whitespace-nowrap flex items-center gap-2">
                  <Icon icon={uploadingTrailer ? 'mdi:loading' : 'mdi:video-upload'} className={uploadingTrailer ? 'animate-spin' : ''} />
                  {uploadingTrailer ? 'Uploading…' : 'Upload video'}
                  <input type="file" accept="video/*" className="hidden" onChange={handleUploadTrailer} disabled={uploadingTrailer} />
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 rounded-lg bg-accent-red font-medium">{editingMovie ? 'Update' : 'Add'}</button>
              {editingMovie && (
                <button type="button" onClick={() => { setEditingMovie(null); setForm(emptyMovie); }} className="px-4 py-2 rounded-lg glass">Cancel</button>
              )}
            </div>
          </form>
          <div className="glass rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-4 font-sansation">Title</th>
                  <th className="p-4 font-sansation">ID</th>
                  <th className="p-4 font-sansation">Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((m) => (
                  <tr key={m._id} className="border-b border-white/5">
                    <td className="p-4">{m.title}</td>
                    <td className="p-4 text-gray-400">{m.movieId}</td>
                    <td className="p-4 flex gap-2">
                      <button type="button" onClick={() => handleEditMovie(m)} className="text-blue-400 hover:underline">Edit</button>
                      <button type="button" onClick={() => handleDeleteMovie(m._id)} className="text-red-400 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
