import Favorites from '../models/Favorites.js';
import History from '../models/History.js';

export const getFavorites = async (req, res, next) => {
  try {
    const list = await Favorites.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
};

export const addFavorite = async (req, res, next) => {
  try {
    const { movieId, title, posterUrl, releaseDate, rating, genre } = req.body;
    if (!movieId) return res.status(400).json({ message: 'movieId is required' });
    const existing = await Favorites.findOne({ userId: req.user._id, movieId });
    if (existing) return res.json(existing);
    const fav = await Favorites.create({
      userId: req.user._id,
      movieId,
      title: title || '',
      posterUrl: posterUrl || '',
      releaseDate: releaseDate || '',
      rating: rating || 0,
      genre: Array.isArray(genre) ? genre : [],
    });
    res.status(201).json(fav);
  } catch (err) {
    next(err);
  }
};

export const removeFavorite = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    await Favorites.findOneAndDelete({ userId: req.user._id, movieId });
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    next(err);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const list = await History.find({ userId: req.user._id }).sort({ lastWatchedAt: -1 }).limit(50);
    res.json(list);
  } catch (err) {
    next(err);
  }
};

export const addToHistory = async (req, res, next) => {
  try {
    const { movieId, title, posterUrl, progress, duration } = req.body;
    if (!movieId) return res.status(400).json({ message: 'movieId is required' });
    const doc = await History.findOneAndUpdate(
      { userId: req.user._id, movieId },
      {
        title: title || '',
        posterUrl: posterUrl || '',
        progress: progress ?? 0,
        duration: duration ?? 0,
        lastWatchedAt: new Date(),
      },
      { upsert: true, new: true }
    );
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

export const removeFromHistory = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    await History.findOneAndDelete({ userId: req.user._id, movieId });
    res.json({ message: 'Removed from history' });
  } catch (err) {
    next(err);
  }
};
