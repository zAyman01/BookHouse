import multer from 'multer';
import path from 'path';
import AppError from './appError.util.js';
import { UPLOAD_PATHS } from '../config/constants.config.js';

// ─── Storage: Book Files (PDF / epub) ────────────────────────────────────────
const bookStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_PATHS.BOOKS),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `book-${unique}${path.extname(file.originalname)}`);
  },
});

const bookFileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'application/epub+zip'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF and EPUB files are allowed for books.', 400), false);
  }
};

// ─── Storage: Cover Images ────────────────────────────────────────────────────
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_PATHS.COVERS),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `cover-${unique}${path.extname(file.originalname)}`);
  },
});

const coverFileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG, and WebP images are allowed for covers.', 400), false);
  }
};

// ─── Exported Multer Instances ────────────────────────────────────────────────

/** Upload a single book file (field name: "bookFile") */
export const uploadBookFile = multer({
  storage: bookStorage,
  fileFilter: bookFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
}).single('bookFile');

/** Upload a single cover image (field name: "coverImage") */
export const uploadCoverImage = multer({
  storage: coverStorage,
  fileFilter: coverFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single('coverImage');

/**
 * Combined upload for create/update book routes.
 * Use this instead of chaining uploadCoverImage + uploadBookFile —
 * chaining two .single() instances overwrites req.file on the second pass.
 * Both files land in req.files independently:
 *   req.files?.coverImage?.[0]?.path
 *   req.files?.bookFile?.[0]?.path
 */
const combinedStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, file.fieldname === 'coverImage' ? UPLOAD_PATHS.COVERS : UPLOAD_PATHS.BOOKS);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const prefix = file.fieldname === 'coverImage' ? 'cover' : 'book';
    cb(null, `${prefix}-${unique}${path.extname(file.originalname)}`);
  },
});

const combinedFileFilter = (req, file, cb) => {
  if (file.fieldname === 'coverImage') {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new AppError('Only JPEG, PNG, and WebP images are allowed for covers.', 400), false);
  } else {
    const allowed = ['application/pdf', 'application/epub+zip'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new AppError('Only PDF and EPUB files are allowed for books.', 400), false);
  }
};

export const uploadBookFiles = multer({
  storage: combinedStorage,
  fileFilter: combinedFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
}).fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'bookFile',   maxCount: 1 },
]);
