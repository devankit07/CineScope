import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { updateUser } from '@/redux/slices/authSlice';
import { authApi } from '@/services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const [name, setName] = useState(user?.name ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setLastName(user.lastName ?? '');
    }
  }, [user?.id, user?.name, user?.lastName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authApi.updateProfile({ name: name.trim(), lastName: lastName.trim() });
      dispatch(updateUser(data.user));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    setUploading(true);
    try {
      const { data } = await authApi.uploadAvatar(file);
      dispatch(updateUser(data.user));
      toast.success('Profile picture updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass rounded-2xl p-8 shadow-2xl"
      >
        <h1 className="font-sansation text-2xl font-bold text-white mb-2">Profile</h1>
        <p className="text-gray-400 mb-6">Update your name and profile picture</p>

        <div className="flex flex-col items-center mb-8">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="relative rounded-full overflow-hidden w-24 h-24 bg-white/10 border-2 border-white/20 hover:border-accent-red/50 transition-colors flex items-center justify-center"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl text-gray-400 font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
            {uploading && (
              <span className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Icon icon="mdi:loading" className="w-8 h-8 animate-spin text-white" />
              </span>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <span className="mt-2 text-sm text-gray-400">Click to change photo</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              First name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-accent-red/50 outline-none"
              placeholder="First name"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-accent-red/50 outline-none"
              placeholder="Last name"
            />
          </div>
          <p className="text-sm text-gray-500">Email: {user?.email}</p>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-lg bg-accent-red hover:bg-red-600 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
          >
            {saving ? (
              <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
            ) : (
              'Save changes'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
