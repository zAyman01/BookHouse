import User from '../models/user.model.js';
import Book from '../models/book.model.js';
import ReadingProgress from '../models/readingProgress.model.js';
import Otp from '../models/otp.model.js';
import Order from '../models/order.model.js';
import Review from '../models/review.model.js';
import Follow from '../models/follow.model.js';
import Cart from '../models/cart.model.js';
import AppError from '../utils/appError.util.js';
import generateToken from '../utils/generateToken.util.js';
import { sendOtpEmail } from './email.service.js';

/**
 * Strips sensitive fields before sending a user object to the client.
 * Even though password is select:false, this is a safety net for any
 * future field that should never be exposed.
 */
const sanitizeUser = (user) => {
  const obj = user.toObject();
  delete obj.password;
  return obj;
};

// ─── Register ────────────────────────────────────────────────────────────────
export const registerUser = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already in use', 409);

  const user = await User.create({ name, email, password, role });
  const token = generateToken(user._id);

  return { user: sanitizeUser(user), token };
};

// ─── Update Profile ───────────────────────────────────────────────────────────
export const updateProfile = async (userId, updates) => {
  const allowed = ['name', 'email', 'avatar'];
  const sanitized = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) sanitized[key] = updates[key];
  }

  if (sanitized.email) {
    if (!updates.currentPassword) {
      throw new AppError('Current password is required to change email', 400);
    }
    const user = await User.findById(userId).select('+password');
    if (!user) throw new AppError('User not found', 404);
    const isMatch = await user.comparePassword(updates.currentPassword);
    if (!isMatch) throw new AppError('Current password is incorrect', 401);

    const existing = await User.findOne({ email: sanitized.email, _id: { $ne: userId } });
    if (existing) throw new AppError('Email already in use', 409);
  }

  const user = await User.findByIdAndUpdate(userId, sanitized, {
    new: true,
    runValidators: true,
  });

  if (!user) throw new AppError('User not found', 404);
  return sanitizeUser(user);
};

// ─── Change Password ──────────────────────────────────────────────────────────
export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('User not found', 404);

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new AppError('Current password is incorrect', 401);
  if (currentPassword === newPassword) throw new AppError('New password must be different from current password', 400);

  user.password = newPassword;
  await user.save();

  return sanitizeUser(user);
};

// ─── Upload Avatar ────────────────────────────────────────────────────────────
export const uploadUserAvatar = async (userId, imagePath) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { avatar: imagePath },
    { new: true }
  );
  if (!user) throw new AppError('User not found', 404);
  return sanitizeUser(user);
};

// ─── Login ───────────────────────────────────────────────────────────────────
export const loginUser = async ({ email, password }) => {
  // password is select:false — must explicitly request it
  const user = await User.findOne({ email }).select('+password');

  // Use the same generic message for both "not found" and "wrong password"
  // so we don't leak which one is wrong to an attacker
  if (!user) throw new AppError('Invalid email or password', 401);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError('Invalid email or password', 401);

  if (!user.isActive) throw new AppError('Your account has been deactivated', 403);

  const token = generateToken(user._id);

  return { user: sanitizeUser(user), token };
};

// ─── Forgot Password ─────────────────────────────────────────────────────────
export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError('No account with that email', 404);

  await Otp.deleteMany({ email, used: false });
  const otpRecord = await Otp.generate(email);
  await sendOtpEmail(email, otpRecord.otp);
  return { message: 'If that email exists, a reset code has been sent.' };
};

// ─── Verify OTP (check-only, does not consume) ───────────────────────────────
export const verifyOtpHandler = async (email, otp) => {
  const record = await Otp.findOne({ email, otp, used: false, expiresAt: { $gt: new Date() } });
  if (!record) throw new AppError('Invalid or expired OTP', 400);
  return { verified: true };
};

// ─── Reset Password ──────────────────────────────────────────────────────────
export const resetPassword = async (email, otp, newPassword) => {
  const record = await Otp.findOne({ email, otp, used: false, expiresAt: { $gt: new Date() } });
  if (!record) throw new AppError('Invalid or expired OTP', 400);
  record.used = true;
  await record.save();

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new AppError('User not found', 404);
  user.password = newPassword;
  await user.save();
  const token = generateToken(user._id);
  return { user: sanitizeUser(user), token };
};

// ─── Delete Account ───────────────────────────────────────────────────────────
export const deleteAccount = async (userId) => {
  // Deactivate user first so they can't authenticate during cleanup
  await User.findByIdAndUpdate(userId, { isActive: false, email: `deleted-${userId}@bookhouse.com` });
  // Then clean up all their data
  await Promise.all([
    Book.deleteMany({ author: userId }),
    Review.deleteMany({ userId }),
    Follow.deleteMany({ $or: [{ follower: userId }, { following: userId }] }),
    Cart.findOneAndDelete({ user: userId }),
    Order.deleteMany({ userId }),
    ReadingProgress.deleteMany({ userId }),
  ]);
};
