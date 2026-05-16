import Book from '../models/book.model.js';
import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import Coupon from '../models/coupon.model.js';
import AppError from '../utils/appError.util.js';
import paginate from '../helpers/paginate.helper.js';
import { ORDER_STATUS, ROLES } from '../config/constants.config.js';
import { sendSaleNotification } from './email.service.js';

export const placeOrder = async ({ bookIds, couponCode }, requestingUser) => {
  const books = await Book.find({ _id: { $in: bookIds }, isPublished: true });

  if (books.length !== bookIds.length) {
    throw new AppError('One or more books do not exist or are not published', 400);
  }

  const alreadyOwned = books.filter((b) =>
    requestingUser.library.some((id) => id.equals(b._id))
  );
  if (alreadyOwned.length > 0) {
    const titles = alreadyOwned.map((b) => b.title).join(', ');
    throw new AppError(`You already own: ${titles}`, 400);
  }

  const orderBooks = books.map((b) => ({
    book: b._id,
    priceAtPurchase: b.price,
  }));

  const rawTotal = orderBooks.reduce((sum, b) => sum + b.priceAtPurchase, 0);
  let discountAmount = 0;

  if (couponCode) {
    const coupon = await Coupon.validateCoupon(couponCode).catch((err) => {
      throw new AppError(err.message, 400);
    });
    discountAmount = (rawTotal * coupon.discountPercent) / 100;

    const order = await Order.create({
      userId: requestingUser._id,
      books: orderBooks,
      totalPrice: rawTotal - discountAmount,
      appliedCoupon: couponCode.toUpperCase(),
      discountAmount,
      status: ORDER_STATUS.COMPLETED,
    });

    await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
    await User.findByIdAndUpdate(requestingUser._id, {
      $addToSet: { library: { $each: bookIds } },
    });

    notifyAuthors(books, requestingUser.name);
    return order;
  }

  const order = await Order.create({
    userId: requestingUser._id,
    books: orderBooks,
    totalPrice: rawTotal,
    status: ORDER_STATUS.COMPLETED,
  });

  await User.findByIdAndUpdate(requestingUser._id, {
    $addToSet: { library: { $each: bookIds } },
  });

  notifyAuthors(books, requestingUser.name);
  return order;
};

async function notifyAuthors(books, buyerName) {
  const authorIds = [...new Set(books.map((b) => b.author.toString()))];
  const authors = await User.find({ _id: { $in: authorIds } }).select('email').lean();
  for (const author of authors) {
    const authorBooks = books.filter((b) => b.author.toString() === author._id.toString());
    for (const book of authorBooks) {
      sendSaleNotification(author.email, { bookTitle: book.title, buyerName, amount: book.price }).catch(() => {});
    }
  }
}

export const getMyOrders = async (userId, query) => {
  const { skip, limit, currentPage } = paginate(query);
  const filter = { userId };

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('books.book', 'title coverImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return { orders, total, totalPages, currentPage, limit };
};

export const getOrderById = async (orderId, requestingUser) => {
  const order = await Order.findById(orderId)
    .populate('books.book', 'title coverImage price')
    .lean();

  if (!order) throw new AppError('Order not found', 404);

  const isOwner = order.userId.toString() === requestingUser._id.toString();
  const isAdmin = requestingUser.role === ROLES.ADMIN;

  if (!isOwner && !isAdmin) {
    throw new AppError('Not authorized to view this order', 403);
  }

  return order;
};

export const getAllOrders = async (query) => {
  const { skip, limit, currentPage } = paginate(query);
  const filter = {};

  if (query.status) filter.status = query.status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('userId', 'name email')
      .populate('books.book', 'title coverImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return { orders, total, totalPages, currentPage, limit };
};
