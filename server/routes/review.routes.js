import { Router } from 'express';
import protect from '../middleware/protect.middleware.js';
import authorize from '../middleware/authorize.middleware.js';
import { ROLES } from '../config/constants.config.js';

const router = Router();

/**
 * Review Routes — /api/reviews
 *
 * Endpoints to implement:
 *   GET    /api/reviews/book/:bookId   → Get all reviews for a book (public)
 *   POST   /api/reviews/book/:bookId   → Add a review [protect, authorize(USER)]
 *   PUT    /api/reviews/:id            → Update own review [protect]
 *   DELETE /api/reviews/:id            → Delete review [protect] (own or admin)
 *
 * Note: After creating/deleting a review, recalculate book ratingsAverage + ratingsCount
 *
 * Controller file to create: controllers/reviewController.js
 * Service file to create:    services/reviewService.js
 * Validator file to create:  validators/reviewValidator.js
 */

// TODO: import reviewController from '../controllers/reviewController.js';

// router.get('/book/:bookId', reviewController.getBookReviews);
// router.post('/book/:bookId', protect, reviewController.createReview);
// router.put('/:id', protect, reviewController.updateReview);
// router.delete('/:id', protect, reviewController.deleteReview);

export default router;
