import catchAsync from '../utils/catchAsync.util.js';
import ApiResponse from '../utils/apiResponse.util.js';
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBookFilePath,
} from '../services/book.service.js';

// ─── GET /api/books ───────────────────────────────────────────────────────────
// Supports: ?search= &genre= &category= &minPrice= &maxPrice= &sort= &page= &limit=
export const getAllBooksHandler = catchAsync(async (req, res) => {
  const result = await getAllBooks(req.query);
  ApiResponse.success(res, result, 'Books fetched successfully');
});

// ─── GET /api/books/:id ───────────────────────────────────────────────────────
export const getBook = catchAsync(async (req, res) => {
  const book = await getBookById(req.params.id);
  ApiResponse.success(res, { book }, 'Book fetched successfully');
});

// ─── POST /api/books ──────────────────────────────────────────────────────────
export const createBookHandler = catchAsync(async (req, res) => {
  // req.files comes from uploadBookFiles (.fields()) — not req.file (.single())
  const book = await createBook(req.body, req.files, req.user);
  ApiResponse.success(res, { book }, 'Book created successfully', 201);
});

// ─── PUT /api/books/:id ───────────────────────────────────────────────────────
export const updateBookHandler = catchAsync(async (req, res) => {
  const book = await updateBook(req.params.id, req.body, req.files, req.user);
  ApiResponse.success(res, { book }, 'Book updated successfully');
});

// ─── DELETE /api/books/:id ────────────────────────────────────────────────────
export const deleteBookHandler = catchAsync(async (req, res) => {
  await deleteBook(req.params.id, req.user);
  ApiResponse.success(res, null, 'Book deleted successfully');
});

// ─── GET /api/books/:id/read ──────────────────────────────────────────────────
// Streams the actual book file — only for users who purchased the book.
// Returns the file directly (not JSON) so no ApiResponse wrapper.
export const readBook = catchAsync(async (req, res) => {
  const filePath = await getBookFilePath(req.params.id, req.user);
  res.sendFile(filePath);
});
