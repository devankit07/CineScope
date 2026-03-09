import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES = '7d';

function toUserPayload(user) {
  return {
    id: user._id,
    _id: user._id,
    email: user.email,
    name: user.name,
    lastName: user.lastName || '',
    avatarUrl: user.avatarUrl || '',
    role: user.role,
    likedClips: Array.isArray(user.likedClips) ? user.likedClips : [],
    watchLater: Array.isArray(user.watchLater) ? user.watchLater : [],
  };
}

export const signUp = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password and name are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ email, password, name });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.status(201).json({ user: toUserPayload(user), token });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.isBanned) return res.status(403).json({ message: 'Account is banned' });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ user: toUserPayload(user), token });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.json({ user: toUserPayload(req.user) });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
  const { name, lastName, avatarUrl } = req.body;
  const updates = {};
  if (typeof name === 'string') updates.name = name.trim();
  if (typeof lastName === 'string') updates.lastName = lastName.trim();
  if (typeof avatarUrl === 'string') updates.avatarUrl = avatarUrl.trim();
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user: toUserPayload(user) });
  } catch (err) {
    next(err);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const result = await uploadToCloudinary(req.file.buffer, {
      resource_type: 'image',
      folder: 'cinescope/avatars',
    });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatarUrl: result.url },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: toUserPayload(user) });
  } catch (err) {
    next(err);
  }
};
