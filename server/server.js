import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Xss from 'xss-clean';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
// Load environment variables
dotenv.config();
const app = express();
app.use(morgan('combined'));
app.use(helmet());
app.use(Xss());
app.use(mongoSanitize());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.', // limit each IP to 100 requests per windowMs
}));

// Middleware
app.use(cors(   
{
  origin: '*',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow all origins (for development, adjust in production)
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes will be added here
// Example: app.use('/api/books', bookRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


