import User from '../models/User.js';
import Movie from '../models/Movie.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const banUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { isBanned: true }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const unbanUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { isBanned: false }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

export const setUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: "role must be 'user' or 'admin'" });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Prevent accidental self-demotion from admin panel.
    if (String(req.user?._id) === String(user._id) && role !== 'admin') {
      return res.status(400).json({ message: 'You cannot remove your own admin role' });
    }

    user.role = role;
    await user.save();
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, isBanned: user.isBanned });
  } catch (err) {
    next(err);
  }
};

export const getAllMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json(movies);
  } catch (err) {
    next(err);
  }
};

export const addMovie = async (req, res, next) => {
  try {
    const { title, posterUrl, description, movieId, releaseDate, trailerYouTubeLink, genre, category } = req.body;
    if (!title || !movieId) return res.status(400).json({ message: 'title and movieId are required' });
    const movie = await Movie.create({
      title,
      posterUrl: posterUrl || '',
      description: description || 'Description not available.',
      movieId: String(movieId).trim(),
      releaseDate: releaseDate || '',
      trailerYouTubeLink: trailerYouTubeLink || '',
      genre: Array.isArray(genre) ? genre : [],
      category: category || 'custom',
    });
    res.status(201).json(movie);
  } catch (err) {
    next(err);
  }
};

export const editMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.movieId != null) {
      updates.movieId = String(updates.movieId).trim();
    }
    const movie = await Movie.findByIdAndUpdate(id, updates, { new: true });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json(movie);
  } catch (err) {
    next(err);
  }
};

export const deleteMovie = async (req, res, next) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findByIdAndDelete(id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json({ message: 'Movie deleted' });
  } catch (err) {
    next(err);
  }
};

/**
 * Upload image or video to Cloudinary. Returns { url } for use as posterUrl or trailer link.
 * Expects multipart file in req.file (from multer).
 */
export const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const type = req.body.type || 'image'; // 'image' | 'video'
    const resourceType = type === 'video' ? 'video' : 'image';
    const result = await uploadToCloudinary(req.file.buffer, {
      resource_type: resourceType,
      folder: 'cinescope',
    });
    res.json({ url: result.url, public_id: result.public_id });
  } catch (err) {
    next(err);
  }
};
