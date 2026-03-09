import multer from 'multer';

const fileFilter = (req, file, cb) => {
  const allowedImage = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const allowedVideo = ['video/mp4', 'video/webm', 'video/quicktime'];
  const allowed = [...allowedImage, ...allowedVideo];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Use image (jpeg, png, webp, gif) or video (mp4, webm).'), false);
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB for videos
});
