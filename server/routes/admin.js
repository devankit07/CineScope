import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import {
  getAllUsers,
  banUser,
  unbanUser,
  deleteUser,
  setUserRole,
  getAllMovies,
  addMovie,
  editMovie,
  deleteMovie,
  uploadMedia,
} from '../controllers/adminController.js';

const router = express.Router();
router.use(protect);
router.use(adminOnly);

router.post('/upload', upload.single('file'), uploadMedia);

router.get('/users', getAllUsers);
router.patch('/users/:id/ban', banUser);
router.patch('/users/:id/unban', unbanUser);
router.patch('/users/:id/role', setUserRole);
router.delete('/users/:id', deleteUser);

router.get('/movies', getAllMovies);
router.post('/movies', addMovie);
router.put('/movies/:id', editMovie);
router.delete('/movies/:id', deleteMovie);

export default router;
