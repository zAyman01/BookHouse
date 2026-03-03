import { Router } from 'express';
import protect from '../middleware/protect.middleware.js';
import authorize from '../middleware/authorize.middleware.js';
import { ROLES } from '../config/constants.config.js';

const router = Router();

/**
 * Book Routes — /api/books
 *
 * Endpoints to implement:
 *   GET    /api/books             → Get all published books (public, with search/filter/pagination)
 *   GET    /api/books/:id         → Get single book details (public)
 *   POST   /api/books             → Create/publish a book [protect, authorize(AUTHOR, ADMIN)]
 *   PUT    /api/books/:id         → Update book [protect, authorize(AUTHOR, ADMIN)]
 *   DELETE /api/books/:id         → Delete book [protect, authorize(AUTHOR, ADMIN)]
 *
 * File uploads: use uploadMiddleware (multer) for coverImage + fileUrl
 *
 * Controller file to create: controllers/bookController.js
 * Service file to create:    services/bookService.js
 * Validator file to create:  validators/bookValidator.js
 * Upload middleware:          utils/uploadMiddleware.js
 */

// TODO: import bookController from '../controllers/bookController.js';
// TODO: import { uploadCoverImage, uploadBookFile } from '../utils/uploadMiddleware.js';

// router.get('/', bookController.getAllBooks);
// router.get('/:id', bookController.getBook);
// router.post('/', protect, authorize(ROLES.AUTHOR, ROLES.ADMIN), uploadCoverImage, uploadBookFile, bookController.createBook);
// router.put('/:id', protect, authorize(ROLES.AUTHOR, ROLES.ADMIN), bookController.updateBook);
// router.delete('/:id', protect, authorize(ROLES.AUTHOR, ROLES.ADMIN), bookController.deleteBook);

export default router;
