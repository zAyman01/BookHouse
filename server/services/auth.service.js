import User from '../models/user.model.js';
import AppError from '../utils/appError.util.js';
import generateToken from '../utils/generateToken.util.js'; // only used in login

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
  // Check email not already taken
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already in use', 409);

  // Create user — password is hashed by the pre('save') hook in the model
  const user = await User.create({ name, email, password, role });

  return { user: sanitizeUser(user) };
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
