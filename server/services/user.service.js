import User from '../models/user.model.js';
import Book from '../models/book.model.js';
import ReadingProgress from '../models/readingProgress.model.js';
import AppError from '../utils/appError.util.js';
import paginate from '../helpers/paginate.helper.js';
import { ROLES } from '../config/constants.config.js';

export const getLibrary = async (userId) => {
  const user = await User.findById(userId)
    .populate({
      path: 'library',
      select: 'title coverImage authorName price genre ratingsAverage',
    })
    .lean();

  return user.library;
};

export const getFavorites = async (userId) => {
  const user = await User.findById(userId)
    .populate({
      path: 'favorites',
      select: 'title coverImage authorName price genre ratingsAverage',
    })
    .lean();

  return user.favorites;
};

export const addFavorite = async (bookId, requestingUser) => {
  const book = await Book.findOne({ _id: bookId, isPublished: true });
  if (!book) throw new AppError('Book not found', 404);

  await User.findByIdAndUpdate(requestingUser._id, {
    $addToSet: { favorites: bookId },
  });

  return null;
};

export const removeFavorite = async (bookId, requestingUser) => {
  await User.findByIdAndUpdate(requestingUser._id, {
    $pull: { favorites: bookId },
  });

  return null;
};

export const getProgress = async (bookId, userId) => {
  const user = await User.findById(userId);
  const ownsBook = user.library.some((id) => id.equals(bookId));
  if (!ownsBook) throw new AppError('You do not own this book', 403);

  const progress = await ReadingProgress.findOne({ userId, bookId }).lean();
  return progress || null;
};

export const updateProgress = async (bookId, data, userId) => {
  const user = await User.findById(userId);
  const ownsBook = user.library.some((id) => id.equals(bookId));
  if (!ownsBook) throw new AppError('You do not own this book', 403);

  const progress = await ReadingProgress.findOneAndUpdate(
    { userId, bookId },
    { currentPage: data.currentPage, lastReadAt: new Date() },
    { upsert: true, new: true }
  ).lean();

  return progress;
};

export const getAllUsers = async (query) => {
  const { skip, limit, currentPage } = paginate(query);
  const filter = {};

  if (query.role) filter.role = query.role;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return { users, total, totalPages, currentPage, limit };
};

export const deactivateUser = async (id) => {
  const targetUser = await User.findById(id);
  if (!targetUser) throw new AppError('User not found', 404);
  if (targetUser.role === ROLES.ADMIN) {
    throw new AppError('Cannot deactivate another admin', 403);
  }

  await User.findByIdAndUpdate(id, { isActive: false });
  return null;
};
