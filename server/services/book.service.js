import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Book from '../models/book.model.js';
import User from '../models/user.model.js';
import Order from '../models/order.model.js';
import Report from '../models/report.model.js';
import AppError from '../utils/appError.util.js';
import paginate from '../helpers/paginate.helper.js';
import { ROLES, REPORT_TYPE } from '../config/constants.config.js';
import * as reviewService from './review.service.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ─── Get All Published Books ──────────────────────────────────────────────────
export const getAllBooks = async (query) => {
  const filter = { isPublished: true };
  let sort = { createdAt: -1 }; // default: newest first

  // Full-text search across title, authorName, description (all in one text index)
  if (query.search) {
    filter.$text = { $search: query.search };
    // When searching, sort by relevance score instead of date
    sort = { score: { $meta: 'textScore' } };
  }

  if (query.genre)    filter.genre    = query.genre;
  if (query.category) filter.category = query.category;
  if (query.format)   filter.format   = query.format;
  if (query.author)   filter.author   = query.author;

  // Price range — both bounds are optional
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  // Manual sort overrides relevance sort only when no search term
  if (!query.search && query.sort) {
    const sortMap = {
      price_asc:  { price: 1 },
      price_desc: { price: -1 },
      rating:     { ratingsAverage: -1 },
      newest:     { createdAt: -1 },
    };
    sort = sortMap[query.sort] || sort;
  }

  const { skip, limit, currentPage } = paginate(query);

  const [books, total] = await Promise.all([
    Book.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('author', 'name')
      .select('-fileUrl')
      .lean(), // lean() strips mongoose overhead for strict read performance
    Book.countDocuments(filter),
  ]);

  return {
    books,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage,
  };
};

// ─── Get My Books (author's own — including unpublished) ─────────────────────
export const getBooksByAuthor = async (authorId) => {
  const books = await Book.find({ author: authorId })
    .select('-fileUrl')
    .populate('author', 'name')
    .sort({ createdAt: -1 })
    .lean();

  return books;
};

// ─── Get Single Book ──────────────────────────────────────────────────────────
export const getBookById = async (id) => {
  const book = await Book.findById(id)
    .populate('author', 'name')
    .select('-fileUrl')
    .lean(); // Faster parsing on GET

  // Return the same 404 for missing AND unpublished — don't reveal draft existence
  if (!book || !book.isPublished) throw new AppError('Book not found', 404);

  return book;
};

// ─── Create Book ──────────────────────────────────────────────────────────────
export const createBook = async (data, files, requestingUser) => {
  const bookData = {
    ...data,
    author:     requestingUser._id,
    authorName: requestingUser.name,
  };

  if (files?.coverImage?.[0]) bookData.coverImage = files.coverImage[0].path;
  if (files?.bookFile?.[0])   bookData.fileUrl    = files.bookFile[0].path;

  const book = await Book.create(bookData);
  return book;
};

// ─── Update Book ──────────────────────────────────────────────────────────────
export const updateBook = async (id, data, files, requestingUser) => {
  const book = await Book.findById(id);
  if (!book) throw new AppError('Book not found', 404);

  // Ownership check — only the book's author or an admin can update
  const isOwner = book.author.toString() === requestingUser._id.toString();
  const isAdmin = requestingUser.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) throw new AppError('You are not authorized to update this book', 403);

  // Replace file paths only if new files were uploaded
  if (files?.coverImage?.[0]) data.coverImage = files.coverImage[0].path;
  if (files?.bookFile?.[0])   data.fileUrl    = files.bookFile[0].path;

  const updated = await Book.findByIdAndUpdate(id, data, {
    new: true,           // return the updated document
    runValidators: true, // enforce schema constraints on partial updates
  });

  return updated;
};

// ─── Publish Book ─────────────────────────────────────────────────────────────
export const publishBook = async (id, requestingUser) => {
  const book = await Book.findById(id);
  if (!book) throw new AppError('Book not found', 404);
  const isOwner = book.author.toString() === requestingUser._id.toString();
  const isAdmin = requestingUser.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) throw new AppError('Not authorized', 403);
  book.isPublished = true;
  await book.save();
  return book;
};

// ─── Delete Book ──────────────────────────────────────────────────────────────
export const deleteBook = async (id, requestingUser) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const book = await Book.findById(id).session(session);
      if (!book) throw new AppError('Book not found', 404);

      const isOwner = book.author.toString() === requestingUser._id.toString();
      const isAdmin = requestingUser.role === ROLES.ADMIN;
      if (!isOwner && !isAdmin) {
        throw new AppError('You are not authorized to delete this book', 403);
      }

      // Remove all reviews for this book
      await reviewService.deleteReviewsByBookId(book._id, { session });

      // Remove book references from all users (favorites + purchased library)
      await User.updateMany(
        {
          $or: [{ favorites: book._id }, { library: book._id }],
        },
        {
          $pull: {
            favorites: book._id,
            library: book._id,
          },
        },
        { session }
      );

      // Remove reports targeting this book only
      await Report.deleteMany(
        { targetId: book._id, type: REPORT_TYPE.BOOK },
        { session }
      );

      await book.deleteOne({ session });
    });
  } finally {
    session.endSession();
  }
};

// ─── Author Analytics ─────────────────────────────────────────────────────────
export const getAuthorAnalytics = async (authorId) => {
  const books = await Book.find({ author: authorId, isPublished: true })
    .select('title price ratingsAverage ratingsCount genre coverImage createdAt')
    .lean();

  const bookIds = books.map((b) => b._id);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [ordersAgg, monthlyAgg, genreAgg] = await Promise.all([
    // Total sales and revenue
    Order.aggregate([
      { $match: { 'books.book': { $in: bookIds }, status: 'completed' } },
      { $unwind: '$books' },
      { $match: { 'books.book': { $in: bookIds } } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$books.priceAtPurchase' },
          thisMonthSales: {
            $sum: {
              $cond: [{ $gte: ['$createdAt', sixMonthsAgo] }, 1, 0],
            },
          },
          thisMonthRevenue: {
            $sum: {
              $cond: [{ $gte: ['$createdAt', sixMonthsAgo] }, '$books.priceAtPurchase', 0],
            },
          },
        },
      },
    ]),
    // Monthly revenue (last 6 months)
    Order.aggregate([
      { $match: { 'books.book': { $in: bookIds }, status: 'completed', createdAt: { $gte: sixMonthsAgo } } },
      { $unwind: '$books' },
      { $match: { 'books.book': { $in: bookIds } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$books.priceAtPurchase' },
          sales: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    // Genre breakdown
    Order.aggregate([
      { $match: { 'books.book': { $in: bookIds }, status: 'completed' } },
      { $unwind: '$books' },
      { $match: { 'books.book': { $in: bookIds } } },
      { $lookup: { from: 'books', localField: 'books.book', foreignField: '_id', as: 'bookInfo' } },
      { $unwind: '$bookInfo' },
      {
        $group: {
          _id: '$bookInfo.genre',
          sales: { $sum: 1 },
          revenue: { $sum: '$books.priceAtPurchase' },
        },
      },
      { $sort: { sales: -1 } },
    ]),
  ]);

  const totalSales = ordersAgg?.[0]?.totalSales || 0;
  const totalRevenue = ordersAgg?.[0]?.totalRevenue || 0;
  const thisMonthSales = ordersAgg?.[0]?.thisMonthSales || 0;
  const thisMonthRevenue = ordersAgg?.[0]?.thisMonthRevenue || 0;
  const avgRating =
    books.reduce((s, b) => s + (b.ratingsAverage || 0), 0) / (books.length || 1);
  const totalBooks = books.length;

  // Per-book sales
  const bookSalesAgg = await Order.aggregate([
    { $match: { 'books.book': { $in: bookIds }, status: 'completed' } },
    { $unwind: '$books' },
    { $match: { 'books.book': { $in: bookIds } } },
    {
      $group: {
        _id: '$books.book',
        sales: { $sum: 1 },
        revenue: { $sum: '$books.priceAtPurchase' },
      },
    },
  ]);
  const salesMap = {};
  for (const s of bookSalesAgg) salesMap[s._id.toString()] = { sales: s.sales, revenue: s.revenue };

  const bookStats = books.map((b) => ({
    _id: b._id,
    title: b.title,
    genre: b.genre,
    coverImage: b.coverImage,
    price: b.price,
    ratingsAverage: b.ratingsAverage || 0,
    ratingsCount: b.ratingsCount || 0,
    sales: salesMap[b._id.toString()]?.sales || 0,
    revenue: salesMap[b._id.toString()]?.revenue || 0,
  }));

  // Top selling book
  bookStats.sort((a, b) => b.sales - a.sales);
  const topBook = bookStats[0] || null;

  // Fill missing months
  const monthlyRevenue = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const found = monthlyAgg.find((m) => m._id === key);
    monthlyRevenue.push({
      month: key,
      revenue: found?.revenue || 0,
      sales: found?.sales || 0,
    });
  }

  return {
    totalBooks,
    totalSales,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    averageRating: Math.round(avgRating * 10) / 10,
    thisMonthSales,
    thisMonthRevenue: Math.round(thisMonthRevenue * 100) / 100,
    topBook,
    monthlyRevenue,
    genreBreakdown: genreAgg.map((g) => ({ genre: g._id, sales: g.sales, revenue: g.revenue })),
    books: bookStats,
  };
};

export const getGenres = async () => {
  const genres = await Book.aggregate([
    { $match: { isPublished: true, genre: { $exists: true, $ne: '' } } },
    { $group: { _id: '$genre', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { name: '$_id', count: 1, _id: 0 } },
  ]);
  return genres;
};

// ─── Get Book File Path (for protected read endpoint) ─────────────────────────
export const getBookFilePath = async (id, requestingUser) => {
  // Fetch only what this endpoint needs.
  const book = await Book.findById(id).select('fileUrl isPublished');
  if (!book || !book.isPublished) throw new AppError('Book not found', 404);

  // Must have purchased the book — library contains flat ObjectIds
  const owns = requestingUser.library.some((libId) => libId.equals(book._id));
  if (!owns) throw new AppError('You must purchase this book to read it', 403);

  if (!book.fileUrl) throw new AppError('No file is available for this book yet', 404);

  // res.sendFile() requires an absolute path — fileUrl stored in DB is relative
  return path.resolve(__dirname, '..', book.fileUrl);
};
