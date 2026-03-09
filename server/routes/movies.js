import express from 'express';
import Movie from '../models/Movie.js';

const router = express.Router();

// Public list for movies added from admin panel.
// Newest first so recently added titles appear at the top.
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '24', 10), 1), 100);
    const movies = await Movie.find().sort({ createdAt: -1 }).limit(limit);
    res.json(movies);
  } catch (err) {
    next(err);
  }
});

// Public single movie fetch for custom/admin-added items.
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findById(id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json(movie);
  } catch (err) {
    next(err);
  }
});

export default router;
