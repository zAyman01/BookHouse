import catchAsync from '../utils/catchAsync.util.js';
import * as couponService from '../services/coupon.service.js';
import ApiResponse from '../utils/apiResponse.util.js';

export const createCoupon = catchAsync(async (req, res) => {
  const coupon = await couponService.createCoupon(req.body);

  ApiResponse.success(res, { coupon }, 'Coupon created successfully', 201);
});

export const getAllCoupons = catchAsync(async (req, res) => {
  const coupons = await couponService.getAllCoupons();

  ApiResponse.success(res, { coupons }, 'Coupons fetched successfully', 200);
});

export const deleteCoupon = catchAsync(async (req, res) => {
  const { id } = req.params;
  await couponService.deleteCoupon(id);

  ApiResponse.success(res, null, 'Coupon deleted successfully', 200);
});

export const validateCoupon = catchAsync(async (req, res) => {
  const { code } = req.body;
  const result = await couponService.validateCoupon(code);

  ApiResponse.success(res, result, 'Coupon is valid', 200);
});
