import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.util.js';
import catchAsync from '../utils/catchAsync.util.js';
import User from '../models/user.model.js';

/**
 * Protect middleware — verifies JWT and attaches req.user.
 *
 * Usage:
 *   router.get('/profile', protect, myController);
 *
 * Expects header:
 *   Authorization: Bearer <token>
 */
const protect = catchAsync(async (req, res, next) => {
  // 1. Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No token provided. Please log in.', 401));
  }

  const token = authHeader.split(' ')[1];

  // 2. Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3. Check user still exists in DB
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('User no longer exists.', 401));
  }

  // 4. Check account is active
  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated.', 401));
  }

  // 5. Attach user to request
  req.user = user;
  next();
});

export default protect;
