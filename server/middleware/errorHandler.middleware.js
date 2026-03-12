import AppError from '../utils/appError.util.js';

/**
 * Global error handling middleware.
 * Must be registered as the LAST middleware in server.js.
 *
 * Handles:
 *  - AppError (operational errors)
 *  - Mongoose CastError (invalid ObjectId)
 *  - Mongoose duplicate key (code 11000)
 *  - Mongoose ValidationError
 *  - JWT JsonWebTokenError
 *  - JWT TokenExpiredError
 *  - Unknown errors → 500
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Mongoose: bad ObjectId (e.g. /api/books/not-an-id)
  if (err.name === 'CastError') {
    error = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  // Mongoose: duplicate key (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new AppError(`${field} already exists`, 409);
  }

  // Mongoose: schema validation failed
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new AppError(messages.join('. '), 400);
  }

  // JWT: invalid token
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again.', 401);
  }

  // JWT: token expired
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your token has expired. Please log in again.', 401);
  }

  // Development: show full stack trace
  if (process.env.NODE_ENV === 'dev') {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      stack: err.stack,
      error: err,
    });
  }

  // Production: only send operational errors to client; hide unknown errors
  if (err.isOperational) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  console.error('UNHANDLED ERROR:', err);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again later.',
  });
};

export default errorHandler;
