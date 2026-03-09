import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getComments, addComment, deleteComment } from '../controllers/commentsController.js';

const router = express.Router();

router.get('/', getComments);
router.post('/', protect, addComment);
router.delete('/:id', protect, deleteComment);

export default router;
