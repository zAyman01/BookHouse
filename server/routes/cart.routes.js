import { Router } from 'express';
import protect from '../middleware/protect.middleware.js';
import * as cartController from '../controllers/cart.controller.js';

const router = Router();

router.get('/', protect, cartController.getCart);
router.post('/', protect, cartController.addToCart);
router.post('/merge', protect, cartController.mergeCart);
router.put('/:bookId', protect, cartController.updateCartItem);
router.delete('/:bookId', protect, cartController.removeFromCart);
router.delete('/', protect, cartController.clearCart);

export default router;
