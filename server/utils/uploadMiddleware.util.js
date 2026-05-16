import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.config.js';
import AppError from './appError.util.js';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_BOOK_TYPES = ['application/pdf', 'application/epub+zip'];

// Covers go to Cloudinary
const coverStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'book-house/covers',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 600, height: 900, crop: 'fill' }],
    public_id: () => `cover-${Date.now()}`,
  },
});

// Book files use memoryStorage (no disk on Vercel)
const bookStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'coverImage') {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) return cb(null, true);
    return cb(new AppError('Only JPEG, PNG, and WebP images are allowed for covers.', 400), false);
  }
  if (ALLOWED_BOOK_TYPES.includes(file.mimetype)) return cb(null, true);
  cb(new AppError('Only PDF and EPUB files are allowed for books.', 400), false);
};

const combinedStorage = {
  _handleFile: (req, file, cb) => {
    if (file.fieldname === 'coverImage') {
      coverStorage._handleFile(req, file, cb);
    } else {
      bookStorage._handleFile(req, file, cb);
    }
  },
  _removeFile: (req, file, cb) => {
    if (file.fieldname === 'coverImage') {
      coverStorage._removeFile(req, file, cb);
    } else {
      bookStorage._removeFile(req, file, cb);
    }
  },
};

export const uploadBookFiles = multer({
  storage: combinedStorage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
}).fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'bookFile', maxCount: 1 },
]);
