import AppError from '../utils/appError.util.js';

/**
 * Validates req.body against a Joi schema.
 * Collects ALL validation errors at once (abortEarly: false).
 * On failure, forwards a single 400 AppError with all messages joined.
 *
 * Usage:
 *   import validate from '../middleware/validate.middleware.js';
 *   import { registerSchema } from '../validators/auth.validator.js';
 *
 *   router.post('/register', validate(registerSchema), authController.register);
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map((d) => d.message).join('. ');
    return next(new AppError(message, 400));
  }
  next();
};

export default validate;
