import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getShorts,
  likeClip,
  unlikeClip,
  saveClip,
  unsaveClip,
  recordView,
  getHistory,
} from '../controllers/shortsController.js';

const router = express.Router();
router.get('/', getShorts);

router.use(protect);
router.post('/like', likeClip);
router.post('/unlike', unlikeClip);
router.post('/save', saveClip);
router.post('/unsave', unsaveClip);
router.post('/view', recordView);
router.get('/history', getHistory);

export default router;
