import mongoose from 'mongoose';
import { ORDER_STATUS } from '../config/constants.config.js';

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    books: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative'],
    },
    appliedCoupon: {
      type: String,
      default: null,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.COMPLETED,
    },
  },
  { timestamps: true }
);

// Indexes
orderSchema.index({ userId: 1 });            // orders by user
orderSchema.index({ status: 1 });            // filter by status
orderSchema.index({ createdAt: -1 });        // latest orders first

const Order = mongoose.model('Order', orderSchema);
export default Order;
