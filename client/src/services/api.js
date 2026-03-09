import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${baseURL}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cinescope_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cinescope_token');
      localStorage.removeItem('cinescope_user');
      window.dispatchEvent(new Event('storage'));
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  signUp: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (body) => api.patch('/auth/profile', body),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/auth/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const favoritesApi = {
  get: () => api.get('/favorites'),
  add: (body) => api.post('/favorites', body),
  remove: (movieId) => api.delete(`/favorites/${movieId}`),
};

export const historyApi = {
  get: () => api.get('/history'),
  add: (body) => api.post('/history', body),
  remove: (movieId) => api.delete(`/history/${movieId}`),
};

export const shortsApi = {
  getClips: () => api.get('/shorts'),
  like: (movieId) => api.post('/shorts/like', { movieId }),
  unlike: (movieId) => api.post('/shorts/unlike', { movieId }),
  save: (movieId) => api.post('/shorts/save', { movieId }),
  unsave: (movieId) => api.post('/shorts/unsave', { movieId }),
  recordView: (movieId) => api.post('/shorts/view', { movieId }),
  getHistory: () => api.get('/shorts/history'),
};

export const commentsApi = {
  getByMovie: (movieId) => api.get('/comments', { params: { movieId } }),
  add: (movieId, text) => api.post('/comments', { movieId, text }),
  delete: (id) => api.delete(`/comments/${id}`),
};

export const moviesApi = {
  getPublic: (params = {}) => api.get('/movies', { params }),
  getById: (id) => api.get(`/movies/${id}`),
};

export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  banUser: (id) => api.patch(`/admin/users/${id}/ban`),
  unbanUser: (id) => api.patch(`/admin/users/${id}/unban`),
  setUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getMovies: () => api.get('/admin/movies'),
  addMovie: (body) => api.post('/admin/movies', body),
  editMovie: (id, body) => api.put(`/admin/movies/${id}`, body),
  deleteMovie: (id) => api.delete(`/admin/movies/${id}`),
  /** Upload image or video to Cloudinary. type: 'image' | 'video', file: File. Returns { url }. */
  upload: (file, type = 'image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
