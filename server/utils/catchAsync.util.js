/**
 * Wraps async controller functions to avoid repetitive try/catch blocks.
 * Forwards any thrown error to Express error handler via next().
 *
 * Usage:
 *   export const myController = catchAsync(async (req, res, next) => {
 *     // your async logic here
 *   });
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default catchAsync;
