import Review from '../models/review.model.js';
import Book from '../models/book.model.js';
import AppError from '../utils/appError.util.js';
import paginate from '../helpers/paginate.helper.js';
import { ROLES } from '../config/constants.config.js';

/**
 * Recalculate book ratings from source-of-truth review data.
 * This avoids drift from rounded averages and handles concurrent writes safely.
 */
const updateBookRatings = async (bookId, options = {}) => {
  const stats = await Review.aggregate([
    { $match: { bookId: bookId } },
    {
      $group: {
        _id: null,
        avg: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]).session(options.session || null);

  await Book.findByIdAndUpdate(
    bookId,
    {
      ratingsAverage: stats[0]?.avg ?? 0,
      ratingsCount: stats[0]?.count ?? 0,
    },
    options
  );
};

export const getBookReviews = async (bookId, query) => {
  const book = await Book.findOne({ _id: bookId, isPublished: true });
  if (!book) {
    throw new AppError('Book not found or not published', 404);
  }

  const { skip, limit, currentPage } = paginate(query);
  const filter = { bookId };

  // Used .lean() for faster read-only parsing 
  const reviews = await Review.find(filter)
    .populate('userId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Review.countDocuments(filter);

  return {
    reviews,
    pagination: {
      total,
      page: currentPage,
      pages: Math.ceil(total / limit),
      limit,
    },
  };
};

export const createReview = async (bookId, data, requestingUser) => {
  // Check purchase gate
  const hasPurchased = requestingUser.library.some(
    (id) => id.toString() === bookId.toString()
  );
  if (!hasPurchased) {
    throw new AppError('You must purchase this book before reviewing it', 403);
  }

  const book = await Book.findOne({ _id: bookId, isPublished: true });
  if (!book) {
    throw new AppError('Book not found or not published', 404);
  }

  // Duplicate review checking is handled by MongoDB's unique index on { userId, bookId }
  // Error 11000 will be thrown and converted to 409 by global errorHandler
  const review = await Review.create({
    ...data,
    bookId,
    userId: requestingUser._id,
  });

  await updateBookRatings(book._id);

  return review;
};

export const updateReview = async (reviewId, data, requestingUser) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError('Review not found', 404);
  }

  if (review.userId.toString() !== requestingUser._id.toString()) {
    throw new AppError('Not authorized to update this review', 403);
  }

  const updatedReview = await Review.findByIdAndUpdate(
    reviewId,
    { ...data },
    { new: true, runValidators: true }
  );

  await updateBookRatings(review.bookId);

  return updatedReview;
};

export const deleteReview = async (reviewId, requestingUser) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError('Review not found', 404);
  }

  // Allow if owner OR admin
  const isOwner = review.userId.toString() === requestingUser._id.toString();
  const isAdmin = requestingUser.role === ROLES.ADMIN;

  if (!isOwner && !isAdmin) {
    throw new AppError('Not authorized to delete this review', 403);
  }

  await Review.findByIdAndDelete(reviewId);
  await updateBookRatings(review.bookId);

  return null;
};
export const deleteReviewsByBookId = async (bookId, options = {}) => {
  await Review.deleteMany({ bookId }, options);
};