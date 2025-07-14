import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('comment service: mongodb connected successfully');
  } catch (error) {
    console.error('comment service: mongodb connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
