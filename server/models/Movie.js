import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    movieId: { type: mongoose.Schema.Types.Mixed, required: true, unique: true },
    title: { type: String, required: true },
    posterUrl: { type: String, default: '' },
    description: { type: String, default: 'Description not available.' },
    releaseDate: { type: String, default: '' },
    trailerYouTubeLink: { type: String, default: '' },
    genre: { type: [String], default: [] },
    category: { type: String, enum: ['trending', 'popular', 'top_rated', 'upcoming', 'custom'], default: 'custom' },
    rating: { type: Number, default: 0 },
    popularity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Movie', movieSchema);
