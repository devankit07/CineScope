import mongoose from 'mongoose';
const { Schema } = mongoose;

const favoritesSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    movieId: { type: Schema.Types.Mixed, required: true }, // TMDB number or OMDB imdbID string
    title: { type: String, default: '' },
    posterUrl: { type: String, default: '' },
    releaseDate: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    genre: { type: [String], default: [] },
  },
  { timestamps: true }
);

favoritesSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export default mongoose.model('Favorites', favoritesSchema);
