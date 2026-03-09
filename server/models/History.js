import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    movieId: { type: mongoose.Schema.Types.Mixed, required: true }, // TMDB number or OMDB imdbID string
    title: { type: String, default: '' },
    posterUrl: { type: String, default: '' },
    progress: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    lastWatchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

historySchema.index({ userId: 1, movieId: 1 });

export default mongoose.model('History', historySchema);
