import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    name: { type: String, required: true, trim: true },
    lastName: { type: String, default: '', trim: true },
    avatarUrl: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isBanned: { type: Boolean, default: false },
    likedClips: { type: [mongoose.Schema.Types.Mixed], default: [] },
    watchLater: { type: [mongoose.Schema.Types.Mixed], default: [] },
    recentClipsViewed: [{ movieId: mongoose.Schema.Types.Mixed, viewedAt: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
