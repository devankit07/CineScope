import mongoose from 'mongoose';

const shortClipSchema = new mongoose.Schema(
  {
    movieId: { type: mongoose.Schema.Types.Mixed, required: true },
    title: { type: String, required: true, trim: true },
    videoUrl: { type: String, default: '' },
    poster: { type: String, default: '' },
    genre: { type: String, default: '' },
  },
  { timestamps: true }
);

shortClipSchema.index({ createdAt: -1 });

export default mongoose.model('ShortClip', shortClipSchema);
