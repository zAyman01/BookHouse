import Coupon from '../models/coupon.model.js';
import AppError from '../utils/appError.util.js';

export const createCoupon = async (data) => {
  // Explicitly uppercase code before save
  const code = data.code.toUpperCase();
  
  const existingCoupon = await Coupon.findOne({ code });
  if (existingCoupon) {
    throw new AppError('Coupon code already exists', 400);
  }

  const coupon = await Coupon.create({
    ...data,
    code,
  });

  return coupon;
};

export const getAllCoupons = async () => {
  return await Coupon.find().sort({ createdAt: -1 }).lean();
};

export const deleteCoupon = async (id) => {
  const coupon = await Coupon.findByIdAndDelete(id);
  
  if (!coupon) {
    throw new AppError('Coupon not found', 404);
  }

  return null;
};

export const validateCoupon = async (code) => {
  try {
    const coupon = await Coupon.validateCoupon(code);
    
    return {
      discountPercent: coupon.discountPercent,
      code: coupon.code,
    };
  } catch (err) {
    throw new AppError(err.message, 400);
  }
};
