import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    movieId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

commentSchema.index({ movieId: 1, createdAt: -1 });

export default mongoose.model('Comment', commentSchema);
