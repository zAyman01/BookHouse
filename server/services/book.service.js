import path from 'path';
import { fileURLToPath } from 'url';
import Book from '../models/book.model.js';
import AppError from '../utils/appError.util.js';
import paginate from '../helpers/paginate.helper.js';
import { ROLES } from '../config/constants.config.js';

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
      .select('-fileUrl'), // fileUrl is internal — never expose the disk path in listings
    Book.countDocuments(filter),
  ]);

  return {
    books,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage,
  };
};

// ─── Get Single Book ──────────────────────────────────────────────────────────
export const getBookById = async (id) => {
  const book = await Book.findById(id)
    .populate('author', 'name email')
    .select('-fileUrl'); // file path never returned — served via /api/books/:id/read

  // Return the same 404 for missing AND unpublished — don't reveal draft existence
  if (!book || !book.isPublished) throw new AppError('Book not found', 404);

  return book;
};

// ─── Create Book ──────────────────────────────────────────────────────────────
export const createBook = async (data, files, requestingUser) => {
  const bookData = {
    ...data,
    // Always set author from the authenticated user — never trust a body-supplied value
    author:     requestingUser._id,
    authorName: requestingUser.name, // snapshot for text search
  };

  // Files are optional at creation — author can upload them later via update
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

// ─── Delete Book ──────────────────────────────────────────────────────────────
export const deleteBook = async (id, requestingUser) => {
  const book = await Book.findById(id);
  if (!book) throw new AppError('Book not found', 404);

  const isOwner = book.author.toString() === requestingUser._id.toString();
  const isAdmin = requestingUser.role === ROLES.ADMIN;
  if (!isOwner && !isAdmin) throw new AppError('You are not authorized to delete this book', 403);

  // Use instance method so future pre/post hooks (e.g. cascade delete reviews) work
  await book.deleteOne();
};

// ─── Get Book File Path (for protected read endpoint) ─────────────────────────
export const getBookFilePath = async (id, requestingUser) => {
  // Need fileUrl here — use explicit select to bring it back (it's excluded by default in other queries)
  const book = await Book.findById(id).select('+fileUrl');
  if (!book || !book.isPublished) throw new AppError('Book not found', 404);

  // Must have purchased the book — library contains flat ObjectIds
  const owns = requestingUser.library.some((libId) => libId.equals(book._id));
  if (!owns) throw new AppError('You must purchase this book to read it', 403);

  if (!book.fileUrl) throw new AppError('No file is available for this book yet', 404);

  // res.sendFile() requires an absolute path — fileUrl stored in DB is relative
  return path.resolve(__dirname, '..', book.fileUrl);
};
