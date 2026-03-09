import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/movieController.js';

const router = express.Router();
router.use(protect);
router.get('/', getFavorites);
router.post('/', addFavorite);
router.delete('/:movieId', removeFavorite);

export default router;
