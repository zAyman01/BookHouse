import { Router } from 'express';
import protect from '../middleware/protect.middleware.js';
import authorize from '../middleware/authorize.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { ROLES } from '../config/constants.config.js';
import { placeOrderSchema } from '../validators/order.validator.js';
import * as orderController from '../controllers/order.controller.js';

const router = Router();

router.post('/', protect, validate(placeOrderSchema), orderController.placeOrder);
router.get('/my', protect, orderController.getMyOrders);
router.get('/:id', protect, orderController.getOrderById);
router.get('/', protect, authorize(ROLES.ADMIN), orderController.getAllOrders);

export default router;
