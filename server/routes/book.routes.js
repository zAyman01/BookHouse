import { Router } from 'express';
import protect from '../middleware/protect.middleware.js';
import authorize from '../middleware/authorize.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { ROLES } from '../config/constants.config.js';
import { uploadBookFiles } from '../utils/uploadMiddleware.util.js';
import { createBookSchema, updateBookSchema } from '../validators/book.validator.js';
import * as bookController from '../controllers/book.controller.js';

const router = Router();

// ─── Public ───────────────────────────────────────────────────────────────────
// GET /api/books?search=&genre=&category=&minPrice=&maxPrice=&sort=&page=&limit=
router.get('/', bookController.getAllBooksHandler);

// ⚠️  /:id/read must be before /:id — otherwise Express captures "read" as the :id param
// GET /api/books/:id/read — streams book file, only for users who purchased it
router.get('/:id/read', protect, bookController.readBook);

// GET /api/books/:id
router.get('/:id', bookController.getBook);

// ─── Author / Admin only ──────────────────────────────────────────────────────
// POST /api/books
// uploadBookFiles runs before validate — multer must parse multipart body first
router.post(
  '/',
  protect,
  authorize(ROLES.AUTHOR, ROLES.ADMIN),
  uploadBookFiles,
  validate(createBookSchema),
  bookController.createBookHandler
);

// PUT /api/books/:id
router.put(
  '/:id',
  protect,
  authorize(ROLES.AUTHOR, ROLES.ADMIN),
  uploadBookFiles,
  validate(updateBookSchema),
  bookController.updateBookHandler
);

// DELETE /api/books/:id
router.delete(
  '/:id',
  protect,
  authorize(ROLES.AUTHOR, ROLES.ADMIN),
  bookController.deleteBookHandler
);

export default router;
