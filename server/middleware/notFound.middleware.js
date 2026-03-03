import AppError from '../utils/appError.util.js';

/**
 * Catches all requests to undefined routes.
 * Must be registered AFTER all route definitions in server.js.
 */
const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

export default notFound;
