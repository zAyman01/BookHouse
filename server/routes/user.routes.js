import { Router } from 'express';
import protect from '../middleware/protect.middleware.js';
import authorize from '../middleware/authorize.middleware.js';
import { ROLES } from '../config/constants.config.js';

const router = Router();

/**
 * User Routes — /api/users
 *
 * Endpoints to implement:
 *   GET    /api/users/library           → Get user's purchased library [protect]
 *   GET    /api/users/favorites         → Get user's favorite books [protect]
 *   POST   /api/users/favorites/:bookId → Add book to favorites [protect]
 *   DELETE /api/users/favorites/:bookId → Remove from favorites [protect]
 *   GET    /api/users/progress/:bookId  → Get reading progress for a book [protect]
 *   PUT    /api/users/progress/:bookId  → Update reading progress [protect]
 *   GET    /api/users                   → Get all users [protect, authorize(ADMIN)]
 *   DELETE /api/users/:id               → Deactivate user [protect, authorize(ADMIN)]
 *
 * Controller file to create: controllers/userController.js
 * Service file to create:    services/userService.js
 */

// TODO: import userController from '../controllers/userController.js';

// router.get('/library', protect, userController.getLibrary);
// router.get('/favorites', protect, userController.getFavorites);
// router.post('/favorites/:bookId', protect, userController.addFavorite);
// router.delete('/favorites/:bookId', protect, userController.removeFavorite);
// router.get('/progress/:bookId', protect, userController.getProgress);
// router.put('/progress/:bookId', protect, userController.updateProgress);
// router.get('/', protect, authorize(ROLES.ADMIN), userController.getAllUsers);
// router.delete('/:id', protect, authorize(ROLES.ADMIN), userController.deactivateUser);

export default router;
