import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getHistory, addToHistory, removeFromHistory } from '../controllers/movieController.js';

const router = express.Router();
router.use(protect);
router.get('/', getHistory);
router.post('/', addToHistory);
router.delete('/:movieId', removeFromHistory);

export default router;
