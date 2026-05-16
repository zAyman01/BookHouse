import mongoose from 'mongoose';

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

const connectDB = async (retryCount = 0) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.error(`MongoDB connection attempt ${retryCount + 1} failed: ${error.message}`);
      console.log(`Retrying in ${RETRY_DELAY / 1000}s...`);
      await new Promise((r) => setTimeout(r, RETRY_DELAY));
      return connectDB(retryCount + 1);
    }
    console.error(`MongoDB connection failed after ${MAX_RETRIES} attempts: ${error.message}`);
    throw error;
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});

export default connectDB;
