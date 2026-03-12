import { Router } from 'express';
import protect from '../middleware/protect.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

// POST /api/auth/register — create new account (user or author only)
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login — receive JWT token
router.post('/login', validate(loginSchema), authController.login);

// GET /api/auth/me — get own profile (requires valid token)
router.get('/me', protect, authController.getMe);

// POST /api/auth/logout — client-side logout signal
router.post('/logout', protect, authController.logout);

export default router;
