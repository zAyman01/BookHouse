import { Router } from 'express';
import protect from '../middleware/protect.middleware.js';

const router = Router();

/**
 * Auth Routes — /api/auth
 *
 * Endpoints to implement:
 *   POST   /api/auth/register   → Register a new user
 *   POST   /api/auth/login      → Login and receive JWT
 *   GET    /api/auth/me         → Get current logged-in user [protect]
 *   POST   /api/auth/logout     → Logout (client-side token removal)
 *
 * Controller file to create: controllers/authController.js
 * Service file to create:    services/authService.js
 * Validator file to create:  validators/authValidator.js
 */

// TODO: import authController from '../controllers/authController.js';
// TODO: import { validate } from '../middleware/validate.js';
// TODO: import { registerSchema, loginSchema } from '../validators/authValidator.js';

// router.post('/register', validate(registerSchema), authController.register);
// router.post('/login', validate(loginSchema), authController.login);
// router.get('/me', protect, authController.getMe);
// router.post('/logout', protect, authController.logout);

export default router;
