import ShortClip from '../models/ShortClip.js';
import User from '../models/User.js';

const RECENT_CLIPS_LIMIT = 50;
const HISTORY_RESPONSE_LIMIT = 30;

export const getShorts = async (req, res, next) => {
  try {
    const clips = await ShortClip.find().sort({ createdAt: -1 }).lean();
    res.json(clips);
  } catch (err) {
    next(err);
  }
};

export const likeClip = async (req, res, next) => {
  try {
    const { movieId } = req.body;
    if (movieId === undefined || movieId === null) {
      return res.status(400).json({ message: 'movieId is required' });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const id = String(movieId);
    if (!user.likedClips) user.likedClips = [];
    const arr = user.likedClips.map((x) => String(x));
    if (arr.includes(id)) {
      return res.json({ liked: true, likedClips: user.likedClips });
    }
    user.likedClips.push(movieId);
    await user.save();
    res.json({ liked: true, likedClips: user.likedClips });
  } catch (err) {
    next(err);
  }
};

export const unlikeClip = async (req, res, next) => {
  try {
    const { movieId } = req.body;
    if (movieId === undefined || movieId === null) {
      return res.status(400).json({ message: 'movieId is required' });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const id = String(movieId);
    if (user.likedClips) {
      user.likedClips = user.likedClips.filter((x) => String(x) !== id);
      await user.save();
    }
    res.json({ liked: false, likedClips: user.likedClips || [] });
  } catch (err) {
    next(err);
  }
};

export const saveClip = async (req, res, next) => {
  try {
    const { movieId } = req.body;
    if (movieId === undefined || movieId === null) {
      return res.status(400).json({ message: 'movieId is required' });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.watchLater) user.watchLater = [];
    const arr = user.watchLater.map((x) => String(x));
    const id = String(movieId);
    if (arr.includes(id)) {
      return res.json({ saved: true, watchLater: user.watchLater });
    }
    user.watchLater.push(movieId);
    await user.save();
    res.json({ saved: true, watchLater: user.watchLater });
  } catch (err) {
    next(err);
  }
};

export const unsaveClip = async (req, res, next) => {
  try {
    const { movieId } = req.body;
    if (movieId === undefined || movieId === null) {
      return res.status(400).json({ message: 'movieId is required' });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const id = String(movieId);
    if (user.watchLater) {
      user.watchLater = user.watchLater.filter((x) => String(x) !== id);
      await user.save();
    }
    res.json({ saved: false, watchLater: user.watchLater || [] });
  } catch (err) {
    next(err);
  }
};

export const recordView = async (req, res, next) => {
  try {
    const { movieId } = req.body;
    if (movieId === undefined || movieId === null) {
      return res.status(400).json({ message: 'movieId is required' });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.recentClipsViewed) user.recentClipsViewed = [];
    user.recentClipsViewed = user.recentClipsViewed.filter((e) => String(e.movieId) !== String(movieId));
    user.recentClipsViewed.unshift({ movieId, viewedAt: new Date() });
    user.recentClipsViewed = user.recentClipsViewed.slice(0, RECENT_CLIPS_LIMIT);
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('recentClipsViewed').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    const list = (user.recentClipsViewed || []).slice(0, HISTORY_RESPONSE_LIMIT);
    res.json(list);
  } catch (err) {
    next(err);
  }
};
