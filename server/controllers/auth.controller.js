import catchAsync from '../utils/catchAsync.util.js';
import ApiResponse from '../utils/apiResponse.util.js';
import {
  registerUser,
  loginUser,
  updateProfile,
  changePassword,
  uploadUserAvatar,
  forgotPassword,
  verifyOtpHandler,
  resetPassword,
  deleteAccount,
} from '../services/auth.service.js';

// ─── POST /api/auth/register ──────────────────────────────────────────────────
// Returns user + token so the frontend can log the user in immediately.
export const register = catchAsync(async (req, res) => {
  const { user, token } = await registerUser(req.body);
  ApiResponse.success(res, { user, token }, 'Registered successfully.', 201);
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
export const login = catchAsync(async (req, res) => {
  const { user, token } = await loginUser(req.body);
  ApiResponse.success(res, { user, token }, 'Logged in successfully');
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
// protect middleware already verified the token and attached req.user
// no service call needed — just return the user that's already on the request
export const getMe = catchAsync(async (req, res) => {
  ApiResponse.success(res, { user: req.user }, 'User fetched successfully');
});

// ─── PUT /api/auth/profile ────────────────────────────────────────────────────
export const updateProfileHandler = catchAsync(async (req, res) => {
  const user = await updateProfile(req.user._id, req.body);
  ApiResponse.success(res, { user }, 'Profile updated successfully');
});

// ─── PUT /api/auth/password ───────────────────────────────────────────────────
export const changePasswordHandler = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await changePassword(req.user._id, currentPassword, newPassword);
  ApiResponse.success(res, { user }, 'Password changed successfully');
});

// ─── PUT /api/auth/avatar ─────────────────────────────────────────────────────
export const uploadAvatarHandler = catchAsync(async (req, res) => {
  if (!req.file) {
    return ApiResponse.error(res, 'No file uploaded', 400);
  }
  const user = await uploadUserAvatar(req.user._id, req.file.path);
  ApiResponse.success(res, { user }, 'Avatar uploaded successfully');
});

// ─── POST /api/auth/forgot-password ───────────────────────────────────────────
export const forgotPasswordHandler = catchAsync(async (req, res) => {
  const result = await forgotPassword(req.body.email);
  ApiResponse.success(res, result, 'OTP sent successfully');
});

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────────
export const verifyOtpHandlerFn = catchAsync(async (req, res) => {
  const result = await verifyOtpHandler(req.body.email, req.body.otp);
  ApiResponse.success(res, result, 'OTP verified');
});

// ─── POST /api/auth/reset-password ─────────────────────────────────────────────
export const resetPasswordHandler = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const result = await resetPassword(email, otp, newPassword);
  ApiResponse.success(res, result, 'Password reset successfully');
});

// ─── DELETE /api/auth/account ──────────────────────────────────────────────────
export const deleteAccountHandler = catchAsync(async (req, res) => {
  await deleteAccount(req.user._id);
  ApiResponse.success(res, null, 'Account deleted successfully');
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
// JWT is stateless — actual invalidation is done client-side by deleting the token.
// This endpoint exists so the client has a consistent API call to trigger on logout.
export const logout = catchAsync(async (req, res) => {
  ApiResponse.success(res, null, 'Logged out successfully');
});
