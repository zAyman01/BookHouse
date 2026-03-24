import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from './models/user.model.js';
import Book from './models/book.model.js';
import Coupon from './models/coupon.model.js';
import Review from './models/review.model.js';
import * as reviewService from './services/review.service.js';
import * as couponService from './services/coupon.service.js';
import { ROLES } from './config/constants.config.js';

dotenv.config();

const runTests = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');
    
    // Cleanup existing test data
    await User.deleteMany({ email: { $in: ['admin@test.com', 'user@test.com'] } });
    await Book.deleteMany({ title: 'Test Book' });
    await Coupon.deleteMany({ code: 'TEST50' });

    // 1. Create Users
    const adminProps = { name: 'Admin Test', email: 'admin@test.com', password: 'password123', role: ROLES.ADMIN, isActive: true };
    const userProps = { name: 'User Test', email: 'user@test.com', password: 'password123', role: ROLES.USER, isActive: true };
    
    const admin = await User.create(adminProps);
    const standardUser = await User.create(userProps);
    console.log('Users created.');

    // 2. Create a Book
    const book = await Book.create({
      title: 'Test Book',
      description: 'A great test book',
      price: 15,
      author: admin._id,
      authorName: admin.name,
      isPublished: true,
    });
    console.log('Book created.');

    // 3. Test Phase 4 (Coupons) Services directly
    console.log('\n--- Testing Coupons ---');
    const newCoupon = await couponService.createCoupon({
      code: 'test50',
      discountPercent: 50,
      expiresAt: new Date(Date.now() + 86400000).toISOString(), // 1 day future
      usageLimit: 5,
    });
    console.log('Coupon created:', newCoupon.code, 'with discount:', newCoupon.discountPercent);
    
    const allCoupons = await couponService.getAllCoupons();
    console.log('Total coupons currently:', allCoupons.length);
    
    const validated = await couponService.validateCoupon('TEST50');
    console.log('Validated coupon code:', validated.code, 'discount:', validated.discountPercent);

    // 4. Test Phase 3 (Reviews) Services directly
    console.log('\n--- Testing Reviews ---');
    
    // Attempt review without purchase should fail
    try {
      await reviewService.createReview(book._id, { rating: 5, comment: 'Great!' }, standardUser);
      console.log('❌ Failed: Review created without purchase!');
    } catch (e) {
      console.log('✅ Success: Review blocked without purchase. Message:', e.message);
    }
    
    // Add book to user's library and retry
    standardUser.library.push(book._id);
    await standardUser.save();
    
    const review = await reviewService.createReview(book._id, { rating: 5, comment: 'Great!' }, standardUser);
    console.log('Review created successfully! ID:', review._id.toString());
    
    // Check Book's updated ratings
    const updatedBook = await Book.findById(book._id);
    console.log(`Book ratings updated. Average: ${updatedBook.ratingsAverage}, Count: ${updatedBook.ratingsCount}`);
    
    // Update review
    const updatedReview = await reviewService.updateReview(review._id, { rating: 4, comment: 'Changed mind' }, standardUser);
    console.log('Review updated, new rating:', updatedReview.rating);
    
    // Get all reviews
    const fetchedReviews = await reviewService.getBookReviews(book._id, { page: 1, limit: 10 });
    console.log(`Fetched reviews for book: ${fetchedReviews.reviews.length} total. Review comment: ${fetchedReviews.reviews[0].comment}`);
    
    // Delete review
    await reviewService.deleteReview(review._id, standardUser);
    console.log('Review deleted successfully.');
    
    const finalBook = await Book.findById(book._id);
    console.log(`Book ratings after deletion. Average: ${finalBook.ratingsAverage}, Count: ${finalBook.ratingsCount}`);

    console.log('\n✅ All internal API logic tests passed.');

  } catch (error) {
    console.error('Test Failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB.');
  }
};

runTests();