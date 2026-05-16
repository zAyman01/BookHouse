import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Book from '../models/book.model.js';
import Review from '../models/review.model.js';
import Follow from '../models/follow.model.js';
import Otp from '../models/otp.model.js';
import Cart from '../models/cart.model.js';

const TEST_MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/book-house-test';

let testUser, testAuthor, testBook, testToken;

beforeAll(async () => {
  await mongoose.connect(TEST_MONGO_URI.replace('bookhouse', 'bookhouse-test'));
  await Promise.all([
    User.deleteMany({ email: /test-/ }),
    Book.deleteMany({ title: /Test Book/ }),
    Review.deleteMany({}),
    Follow.deleteMany({}),
    Otp.deleteMany({}),
    Cart.deleteMany({}),
  ]);
  testUser = await User.create({ name: 'Test User', email: 'test-user@bookhouse.com', password: 'testpass123', role: 'user' });
  testAuthor = await User.create({ name: 'Test Author', email: 'test-author@bookhouse.com', password: 'testpass123', role: 'author' });
  testBook = await Book.create({
    title: 'Test Book', description: 'A test book for unit testing purposes.', price: 14.99,
    author: testAuthor._id, authorName: 'Test Author', genre: 'Fiction', isPublished: true,
  });
});

afterAll(async () => {
  await Promise.all([
    User.deleteMany({ email: /test-/ }),
    Book.deleteMany({ title: /Test Book/ }),
    Review.deleteMany({}),
    Follow.deleteMany({}),
    Otp.deleteMany({}),
    Cart.deleteMany({}),
  ]);
  await mongoose.disconnect();
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const email = `test-new-${Date.now()}@bookhouse.com`;
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New User', email, password: 'testpass123', role: 'user' }),
    });
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.user.email).toBe(email);
    expect(data.data.token).toBeTruthy();
  });

  it('should reject duplicate email registration', async () => {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: 'test-user@bookhouse.com', password: 'testpass123', role: 'user' }),
    });
    expect(res.status).toBe(409);
  });

  it('should reject login with wrong password', async () => {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test-user@bookhouse.com', password: 'wrongpass' }),
    });
    expect(res.status).toBe(401);
  });

  it('should login successfully', async () => {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test-user@bookhouse.com', password: 'testpass123' }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.token).toBeTruthy();
    testToken = data.data.token;
  });
});

// ─── Books ────────────────────────────────────────────────────────────────────
describe('Book Endpoints', () => {
  it('should list published books', async () => {
    const res = await fetch('http://localhost:5000/api/books?limit=5');
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(data.data.books)).toBe(true);
  });

  it('should get a book by id', async () => {
    const res = await fetch(`http://localhost:5000/api/books/${testBook._id}`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.book.title).toBe('Test Book');
  });

  it('should return 404 for non-existent book', async () => {
    const res = await fetch('http://localhost:5000/api/books/000000000000000000000000');
    expect(res.status).toBe(404);
  });

  it('should search books by title', async () => {
    const res = await fetch('http://localhost:5000/api/books?search=Test');
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.books.length).toBeGreaterThan(0);
  });

  it('should return genre counts', async () => {
    const res = await fetch('http://localhost:5000/api/books/genres');
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(data.data.genres)).toBe(true);
  });
});

// ─── Reviews ──────────────────────────────────────────────────────────────────
describe('Review Endpoints', () => {
  it('should reject review from user who has not purchased', async () => {
    const res = await fetch(`http://localhost:5000/api/reviews/book/${testBook._id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${testToken}` },
      body: JSON.stringify({ rating: 4, comment: 'Great book!' }),
    });
    expect(res.status).toBe(403);
  });

  it('should list reviews for a book', async () => {
    const res = await fetch(`http://localhost:5000/api/reviews/book/${testBook._id}`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(data.data.reviews)).toBe(true);
  });
});

// ─── Follow ───────────────────────────────────────────────────────────────────
describe('Follow Endpoints', () => {
  let authorToken;

  beforeAll(async () => {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test-author@bookhouse.com', password: 'testpass123' }),
    });
    const data = await res.json();
    authorToken = data.data.token;
  });

  it('should follow an author', async () => {
    const res = await fetch(`http://localhost:5000/api/follow/${testAuthor._id}`, {
      method: 'POST', headers: { Authorization: `Bearer ${testToken}` },
    });
    expect(res.status).toBe(200);
  });

  it('should not allow duplicate follow', async () => {
    const res = await fetch(`http://localhost:5000/api/follow/${testAuthor._id}`, {
      method: 'POST', headers: { Authorization: `Bearer ${testToken}` },
    });
    expect(res.status).toBe(409);
  });

  it('should return follow stats', async () => {
    const res = await fetch(`http://localhost:5000/api/follow/${testAuthor._id}/stats`);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.followers).toBeGreaterThanOrEqual(1);
  });

  it('should check if following', async () => {
    const res = await fetch(`http://localhost:5000/api/follow/${testAuthor._id}/check`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.following).toBe(true);
  });

  it('should unfollow', async () => {
    const res = await fetch(`http://localhost:5000/api/follow/${testAuthor._id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${testToken}` },
    });
    expect(res.status).toBe(200);
  });
});

// ─── Password Reset ───────────────────────────────────────────────────────────
describe('Password Reset Flow', () => {
  it('should request a password reset', async () => {
    const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test-user@bookhouse.com' }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
  });

  it('should not reveal if email exists', async () => {
    const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@bookhouse.com' }),
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.message).toContain('If that email exists');
  });
});

// ─── Author Analytics ─────────────────────────────────────────────────────────
describe('Author Dashboard', () => {
  let authorToken;
  beforeAll(async () => {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test-author@bookhouse.com', password: 'testpass123' }),
    });
    const data = await res.json();
    authorToken = data.data.token;
  });

  it('should return analytics for author', async () => {
    const res = await fetch('http://localhost:5000/api/books/analytics', {
      headers: { Authorization: `Bearer ${authorToken}` },
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data).toHaveProperty('totalBooks');
    expect(data.data).toHaveProperty('averageRating');
    expect(data.data).toHaveProperty('totalSales');
  });

  it('should return author books', async () => {
    const res = await fetch('http://localhost:5000/api/books/my', {
      headers: { Authorization: `Bearer ${authorToken}` },
    });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(data.data.books)).toBe(true);
  });
});

// ─── Edge Cases ───────────────────────────────────────────────────────────────
describe('Edge Cases', () => {
  it('should reject unauthorized access to protected routes', async () => {
    const res = await fetch('http://localhost:5000/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('should reject invalid ObjectId with meaningful error', async () => {
    const res = await fetch('http://localhost:5000/api/books/invalid-id');
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.message).toContain('Invalid');
  });

  it('should return 404 for unknown routes', async () => {
    const res = await fetch('http://localhost:5000/api/nonexistent');
    expect(res.status).toBe(404);
  });

  it('should require minimum password length', async () => {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Short', email: 'short@test.com', password: '123', role: 'user' }),
    });
    expect(res.status).toBe(400);
  });
});
