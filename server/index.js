import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import movieRoutes from './routes/movies.js';
import favoritesRoutes from './routes/favorites.js';
import historyRoutes from './routes/history.js';
import adminRoutes from './routes/admin.js';
import shortsRoutes from './routes/shorts.js';
import commentsRoutes from './routes/comments.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shorts', shortsRoutes);
app.use('/api/comments', commentsRoutes);

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  return res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(errorHandler);

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cinescope')
  .then(() => {
    app.listen(PORT, () => console.log(`CineScope server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
