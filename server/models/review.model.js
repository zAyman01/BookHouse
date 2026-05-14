import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book reference is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// One review per user per book
reviewSchema.index({ userId: 1, bookId: 1 }, { unique: true });
// Optimize fetching reviews for a book sorted by creation date
reviewSchema.index({ bookId: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
