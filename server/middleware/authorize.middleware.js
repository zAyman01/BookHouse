import AppError from '../utils/appError.util.js';

/**
 * Role-based access control middleware.
 * Must be used AFTER protect middleware.
 *
 * Usage:
 *   import { ROLES } from '../config/constants.js';
 *   router.delete('/books/:id', protect, authorize(ROLES.ADMIN, ROLES.AUTHOR), deleteBook);
 *
 * @param {...string} roles - Allowed roles (from ROLES constants)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`,
          403
        )
      );
    }
    next();
  };
};

export default authorize;
