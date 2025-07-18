import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/booknest_auth');
    console.log('Auth Service: MongoDB connected successfully');
  } catch (error) {
    console.error('Auth Service: MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
