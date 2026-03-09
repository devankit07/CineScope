import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a buffer (from multer memory storage) to Cloudinary.
 * @param {Buffer} buffer - File buffer
 * @param {object} options - { resource_type: 'image' | 'video' | 'auto', folder?: string }
 * @returns {Promise<{ url: string, public_id: string }>}
 */
export function uploadToCloudinary(buffer, options = {}) {
  const { resource_type = 'auto', folder = 'cinescope' } = options;
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, public_id: result.public_id });
      },
      { resource_type, folder }
    );
    stream.end(buffer);
  });
}

export default cloudinary;
