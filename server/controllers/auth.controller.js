import catchAsync from '../utils/catchAsync.util.js';
import ApiResponse from '../utils/apiResponse.util.js';
import { registerUser, loginUser } from '../services/auth.service.js';

// ─── POST /api/auth/register ──────────────────────────────────────────────────
// Returns user only — no token. Frontend redirects to /login after register.
export const register = catchAsync(async (req, res) => {
  const { user } = await registerUser(req.body);
  ApiResponse.success(res, { user }, 'Registered successfully. Please log in.', 201);
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

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
// JWT is stateless — actual invalidation is done client-side by deleting the token.
// This endpoint exists so the client has a consistent API call to trigger on logout.
export const logout = catchAsync(async (req, res) => {
  ApiResponse.success(res, null, 'Logged out successfully');
});
