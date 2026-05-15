import { Router } from 'express';
import protect from '../middleware/protect.middleware.js';
import authorize from '../middleware/authorize.middleware.js';
import { ROLES } from '../config/constants.config.js';
import * as userController from '../controllers/user.controller.js';

const router = Router();

router.get('/library', protect, userController.getLibrary);
router.get('/favorites', protect, userController.getFavorites);
router.post('/favorites/:bookId', protect, userController.addFavorite);
router.delete('/favorites/:bookId', protect, userController.removeFavorite);
router.get('/progress/:bookId', protect, userController.getProgress);
router.put('/progress/:bookId', protect, userController.updateProgress);
router.get('/', protect, authorize(ROLES.ADMIN), userController.getAllUsers);
router.delete('/:id', protect, authorize(ROLES.ADMIN), userController.deactivateUser);

export default router;
