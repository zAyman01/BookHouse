import catchAsync from '../utils/catchAsync.util.js';
import ApiResponse from '../utils/apiResponse.util.js';
import * as cartService from '../services/cart.service.js';

export const getCart = catchAsync(async (req, res) => {
  const cart = await cartService.getCart(req.user._id);
  ApiResponse.success(res, cart, 'Cart fetched successfully');
});

export const addToCart = catchAsync(async (req, res) => {
  const { bookId, quantity } = req.body;
  const cart = await cartService.addToCart(req.user._id, bookId, quantity || 1);
  ApiResponse.success(res, cart, 'Item added to cart');
});

export const updateCartItem = catchAsync(async (req, res) => {
  const cart = await cartService.updateCartItem(req.user._id, req.params.bookId, req.body.quantity);
  ApiResponse.success(res, cart, 'Cart updated');
});

export const removeFromCart = catchAsync(async (req, res) => {
  const cart = await cartService.removeFromCart(req.user._id, req.params.bookId);
  ApiResponse.success(res, cart, 'Item removed from cart');
});

export const clearCart = catchAsync(async (req, res) => {
  await cartService.clearCart(req.user._id);
  ApiResponse.success(res, null, 'Cart cleared');
});

export const mergeCart = catchAsync(async (req, res) => {
  const cart = await cartService.mergeCart(req.user._id, req.body.items);
  ApiResponse.success(res, cart, 'Cart merged successfully');
});
