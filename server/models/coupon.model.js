import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountPercent: {
      type: Number,
      required: [true, 'Discount percentage is required'],
      min: [1, 'Discount must be at least 1%'],
      max: [100, 'Discount cannot exceed 100%'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageLimit: {
      type: Number,
      default: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/**
 * Static method: validate a coupon code
 * Returns the coupon if valid, throws an error if not
 */
couponSchema.statics.validateCoupon = async function (code) {
  const coupon = await this.findOne({ code: code.toUpperCase() });

  if (!coupon) throw new Error('Invalid coupon code');
  if (!coupon.isActive) throw new Error('Coupon is no longer active');
  if (coupon.expiresAt < new Date()) throw new Error('Coupon has expired');
  if (coupon.usedCount >= coupon.usageLimit) throw new Error('Coupon usage limit reached');

  return coupon;
};

// Index for getting all coupons
couponSchema.index({ createdAt: -1 });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
