import express from 'express';
import { signUp, login, getMe, updateProfile, uploadAvatar } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();
router.post('/signup', signUp);
router.post('/login', login);
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);
router.post('/upload-avatar', protect, upload.single('file'), uploadAvatar);

export default router;
