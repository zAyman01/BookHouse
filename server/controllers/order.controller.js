import catchAsync from '../utils/catchAsync.util.js';
import * as orderService from '../services/order.service.js';
import ApiResponse from '../utils/apiResponse.util.js';

export const placeOrder = catchAsync(async (req, res) => {
  const order = await orderService.placeOrder(req.body, req.user);

  ApiResponse.success(res, { order }, 'Order placed successfully', 201);
});

export const getMyOrders = catchAsync(async (req, res) => {
  const result = await orderService.getMyOrders(req.user._id, req.query);

  ApiResponse.success(res, result, 'Orders fetched successfully');
});

export const getOrderById = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user);

  ApiResponse.success(res, { order }, 'Order fetched successfully');
});

export const getAllOrders = catchAsync(async (req, res) => {
  const result = await orderService.getAllOrders(req.query);

  ApiResponse.success(res, result, 'Orders fetched successfully');
});
