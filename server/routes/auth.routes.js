import { Router } from 'express';
import protect from '../middleware/protect.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { uploadAvatar } from '../utils/avatarUpload.util.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

// POST /api/auth/register — create new account (user or author only)
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login — receive JWT token
router.post('/login', validate(loginSchema), authController.login);

// GET /api/auth/me — get own profile (requires valid token)
router.get('/me', protect, authController.getMe);

// PUT /api/auth/profile — update name/email
router.put('/profile', protect, authController.updateProfileHandler);

// PUT /api/auth/password — change password
router.put('/password', protect, authController.changePasswordHandler);

// PUT /api/auth/avatar — upload avatar image
router.put('/avatar', protect, uploadAvatar, authController.uploadAvatarHandler);

// POST /api/auth/forgot-password — request OTP
router.post('/forgot-password', authController.forgotPasswordHandler);

// POST /api/auth/verify-otp — verify OTP
router.post('/verify-otp', authController.verifyOtpHandlerFn);

// POST /api/auth/reset-password — reset password with OTP
router.post('/reset-password', authController.resetPasswordHandler);

// DELETE /api/auth/account — close account
router.delete('/account', protect, authController.deleteAccountHandler);

// POST /api/auth/logout — client-side logout signal
router.post('/logout', protect, authController.logout);

export default router;
