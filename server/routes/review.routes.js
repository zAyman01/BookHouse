import { Router } from 'express';
import protect from '../middleware/protect.middleware.js';
import validate from '../middleware/validate.middleware.js';
import * as reviewController from '../controllers/review.controller.js';
import { createReviewSchema, updateReviewSchema } from '../validators/review.validator.js';

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
 */

router.get('/book/:bookId', reviewController.getBookReviews);
router.post('/book/:bookId', protect, validate(createReviewSchema), reviewController.createReview);
router.put('/:id', protect, validate(updateReviewSchema), reviewController.updateReview);
router.delete('/:id', protect, reviewController.deleteReview);

export default router;
