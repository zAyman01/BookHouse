import { Router } from 'express';
import protect from '../middleware/protect.middleware.js';
import authorize from '../middleware/authorize.middleware.js';
import { ROLES } from '../config/constants.config.js';

const router = Router();

/**
 * Coupon Routes — /api/coupons
 *
 * Endpoints to implement:
 *   POST   /api/coupons              → Create a coupon [protect, authorize(ADMIN)]
 *   GET    /api/coupons              → List all coupons [protect, authorize(ADMIN)]
 *   DELETE /api/coupons/:id          → Delete a coupon [protect, authorize(ADMIN)]
 *   POST   /api/coupons/validate     → Validate a coupon code (called at checkout) [protect]
 *
 * Controller file to create: controllers/couponController.js
 * Service file to create:    services/couponService.js
 */

// TODO: import couponController from '../controllers/couponController.js';

// router.post('/', protect, authorize(ROLES.ADMIN), couponController.createCoupon);
// router.get('/', protect, authorize(ROLES.ADMIN), couponController.getAllCoupons);
// router.delete('/:id', protect, authorize(ROLES.ADMIN), couponController.deleteCoupon);
// router.post('/validate', protect, couponController.validateCoupon);

export default router;
