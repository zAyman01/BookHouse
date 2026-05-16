import Cart from '../models/cart.model.js';
import Book from '../models/book.model.js';
import AppError from '../utils/appError.util.js';

export const getCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.book', 'title price authorName coverImage genre').lean();
  if (!cart) return { items: [] };
  return cart;
};

export const addToCart = async (userId, bookId, quantity = 1) => {
  const book = await Book.findById(bookId);
  if (!book || !book.isPublished) throw new AppError('Book not found', 404);

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [{ book: bookId, quantity }] });
  } else {
    const existing = cart.items.find((i) => i.book.toString() === bookId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ book: bookId, quantity });
    }
    await cart.save();
  }

  return Cart.findById(cart._id).populate('items.book', 'title price authorName coverImage genre').lean();
};

export const updateCartItem = async (userId, bookId, quantity) => {
  if (quantity < 1) throw new AppError('Quantity must be at least 1', 400);
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError('Cart not found', 404);

  const item = cart.items.find((i) => i.book.toString() === bookId);
  if (!item) throw new AppError('Item not in cart', 404);
  item.quantity = quantity;
  await cart.save();

  return Cart.findById(cart._id).populate('items.book', 'title price authorName coverImage genre').lean();
};

export const removeFromCart = async (userId, bookId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError('Cart not found', 404);

  cart.items = cart.items.filter((i) => i.book.toString() !== bookId);
  await cart.save();

  return Cart.findById(cart._id).populate('items.book', 'title price authorName coverImage genre').lean();
};

export const clearCart = async (userId) => {
  await Cart.findOneAndDelete({ user: userId });
};

export const mergeCart = async (userId, guestItems) => {
  if (!guestItems || !Array.isArray(guestItems)) return getCart(userId);

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  for (const guestItem of guestItems) {
    if (!guestItem.book?._id) continue;
    const existing = cart.items.find((i) => i.book.toString() === guestItem.book._id);
    if (existing) {
      existing.quantity = Math.max(existing.quantity, guestItem.quantity || 1);
    } else {
      const book = await Book.findById(guestItem.book._id);
      if (book && book.isPublished) {
        cart.items.push({ book: guestItem.book._id, quantity: guestItem.quantity || 1 });
      }
    }
  }

  await cart.save();
  return Cart.findById(cart._id).populate('items.book', 'title price authorName coverImage genre').lean();
};
