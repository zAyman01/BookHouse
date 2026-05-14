import { Router } from 'express';
import protect from '../middleware/protect.middleware.js';
import authorize from '../middleware/authorize.middleware.js';
import { ROLES } from '../config/constants.config.js';

const router = Router();

/**
 * Order Routes — /api/orders
 *
 * Endpoints to implement:
 *   POST   /api/orders             → Place an order (buy books) [protect]
 *   GET    /api/orders/my          → Get current user's orders [protect]
 *   GET    /api/orders/:id         → Get single order detail [protect]
 *   GET    /api/orders             → Get all orders [protect, authorize(ADMIN)]
 *
 * Note:
 *   - On successful order, add books to user.library
 *   - If couponCode provided, validate via Coupon.validateCoupon() and apply discount
 *
 * Controller file to create: controllers/orderController.js
 * Service file to create:    services/orderService.js
 * Validator file to create:  validators/orderValidator.js
 */

// TODO: import orderController from '../controllers/orderController.js';

// router.post('/', protect, orderController.placeOrder);
// router.get('/my', protect, orderController.getMyOrders);
// router.get('/:id', protect, orderController.getOrder);
// router.get('/', protect, authorize(ROLES.ADMIN), orderController.getAllOrders);

export default router;
