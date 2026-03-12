import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Xss from 'xss-clean';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import path from 'path';
import { fileURLToPath } from 'url';

// Config
import connectDB from './config/db.config.js';

// Middleware
import notFound from './middleware/notFound.middleware.js';
import errorHandler from './middleware/errorHandler.middleware.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import bookRoutes from './routes/book.routes.js';
import reviewRoutes from './routes/review.routes.js';
import orderRoutes from './routes/order.routes.js';
import userRoutes from './routes/user.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import reportRoutes from './routes/report.routes.js';

// ─── Environment ──────────────────────────────────────────────────────────────
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Connect to Database ──────────────────────────────────────────────────────
connectDB();

// ─── App ──────────────────────────────────────────────────────────────────────
const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(morgan('combined'));
app.use(mongoSanitize());  // NoSQL injection protection
app.use(Xss());            // XSS protection
app.use(hpp());            // HTTP Parameter Pollution protection
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later.',
  })
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Static Files ─────────────────────────────────────────────────────────────
// Covers are public (shown in listings/detail pages)
app.use('/uploads/covers', express.static(path.join(__dirname, 'uploads/covers')));
// Book files are NOT served statically — protected via GET /api/books/:id/read

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reports', reportRoutes);

// ─── 404 Handler (must be after all routes) ───────────────────────────────────
app.use(notFound);

// ─── Global Error Handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});


