import catchAsync from '../utils/catchAsync.util.js';
import * as userService from '../services/user.service.js';
import ApiResponse from '../utils/apiResponse.util.js';

export const getLibrary = catchAsync(async (req, res) => {
  const books = await userService.getLibrary(req.user._id);

  ApiResponse.success(res, { books }, 'Library fetched successfully');
});

export const getFavorites = catchAsync(async (req, res) => {
  const books = await userService.getFavorites(req.user._id);

  ApiResponse.success(res, { books }, 'Favorites fetched successfully');
});

export const addFavorite = catchAsync(async (req, res) => {
  const { bookId } = req.params;
  await userService.addFavorite(bookId, req.user);

  ApiResponse.success(res, null, 'Book added to favorites');
});

export const removeFavorite = catchAsync(async (req, res) => {
  const { bookId } = req.params;
  await userService.removeFavorite(bookId, req.user);

  ApiResponse.success(res, null, 'Book removed from favorites');
});

export const getProgress = catchAsync(async (req, res) => {
  const { bookId } = req.params;
  const progress = await userService.getProgress(bookId, req.user._id);

  ApiResponse.success(res, { progress }, 'Progress fetched successfully');
});

export const updateProgress = catchAsync(async (req, res) => {
  const { bookId } = req.params;
  const progress = await userService.updateProgress(bookId, req.body, req.user._id);

  ApiResponse.success(res, { progress }, 'Progress updated successfully');
});

export const getAllUsers = catchAsync(async (req, res) => {
  const result = await userService.getAllUsers(req.query);

  ApiResponse.success(res, result, 'Users fetched successfully');
});

export const deactivateUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  await userService.deactivateUser(id);

  ApiResponse.success(res, null, 'User deactivated successfully');
});
