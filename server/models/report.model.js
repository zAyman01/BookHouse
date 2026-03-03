import mongoose from 'mongoose';
import { REPORT_STATUS, REPORT_TYPE } from '../config/constants.config.js';

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter reference is required'],
    },
    type: {
      type: String,
      enum: Object.values(REPORT_TYPE),
      required: [true, 'Report type is required'],
    },
    // Generic reference — points to a User, Book, or Review _id depending on type
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Target ID is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(REPORT_STATUS),
      default: REPORT_STATUS.PENDING,
    },
    // Admin notes when reviewing/dismissing a report
    adminNotes: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes
reportSchema.index({ status: 1 });           // filter by pending/reviewed
reportSchema.index({ type: 1 });             // filter by report type
reportSchema.index({ reportedBy: 1 });       // reports submitted by a user
reportSchema.index({ createdAt: -1 });       // latest reports first

const Report = mongoose.model('Report', reportSchema);
export default Report;
