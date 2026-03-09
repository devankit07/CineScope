import Comment from '../models/Comment.js';

export const getComments = async (req, res, next) => {
  try {
    const movieId = req.query.movieId;
    if (!movieId) return res.status(400).json({ message: 'movieId required' });
    const comments = await Comment.find({ movieId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(comments);
  } catch (err) {
    next(err);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { movieId, text } = req.body;
    if (!movieId) return res.status(400).json({ message: 'movieId required' });
    const trimmed = (text || '').trim();
    if (!trimmed) return res.status(400).json({ message: 'Comment text required' });
    const displayName = req.user.name + (req.user.lastName ? ` ${req.user.lastName}` : '');
    const comment = await Comment.create({
      movieId,
      userId: req.user._id,
      userName: displayName.trim() || req.user.email,
      text: trimmed.slice(0, 2000),
    });
    const populated = await Comment.findById(comment._id).lean();
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    const isOwner = String(comment.userId) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Not allowed to delete' });
    await Comment.findByIdAndDelete(id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};
