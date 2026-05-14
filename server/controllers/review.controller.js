import catchAsync from '../utils/catchAsync.util.js';
import * as reviewService from '../services/review.service.js';
import ApiResponse from '../utils/apiResponse.util.js';

export const getBookReviews = catchAsync(async (req, res) => {
  const { bookId } = req.params;
  const result = await reviewService.getBookReviews(bookId, req.query);

  ApiResponse.success(res, result, 'Reviews fetched successfully', 200);
});

export const createReview = catchAsync(async (req, res) => {
  const { bookId } = req.params;
  const review = await reviewService.createReview(bookId, req.body, req.user);

  ApiResponse.success(res, { review }, 'Review created successfully', 201);
});

export const updateReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  const review = await reviewService.updateReview(id, req.body, req.user);

  ApiResponse.success(res, { review }, 'Review updated successfully', 200);
});

export const deleteReview = catchAsync(async (req, res) => {
  const { id } = req.params;
  await reviewService.deleteReview(id, req.user);

  ApiResponse.success(res, null, 'Review deleted successfully', 200);
});
