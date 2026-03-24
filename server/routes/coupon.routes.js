import { Router } from 'express';
import protect from '../middleware/protect.middleware.js';
import authorize from '../middleware/authorize.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { ROLES } from '../config/constants.config.js';
import * as couponController from '../controllers/coupon.controller.js';
import { createCouponSchema, validateCouponSchema } from '../validators/coupon.validator.js';

const router = Router();

/**
 * Coupon Routes — /api/coupons
 *
 * Endpoints to implement:
 *   POST   /api/coupons              → Create a coupon [protect, authorize(ADMIN)]
 *   GET    /api/coupons              → List all coupons [protect, authorize(ADMIN)]
 *   DELETE /api/coupons/:id          → Delete a coupon [protect, authorize(ADMIN)]
 *   POST   /api/coupons/validate     → Validate a coupon code (called at checkout) [protect]
 */

router.post('/validate', protect, validate(validateCouponSchema), couponController.validateCoupon);
router.post('/', protect, authorize(ROLES.ADMIN), validate(createCouponSchema), couponController.createCoupon);
router.get('/', protect, authorize(ROLES.ADMIN), couponController.getAllCoupons);
router.delete('/:id', protect, authorize(ROLES.ADMIN), couponController.deleteCoupon);

export default router;
