import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config({ quiet: true });

const app = express();

// connect to database
connectDB();

// middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);

// health check
app.get('/health', (req, res) => {
  res.json({ service: 'auth-service', status: 'healthy' });
});

// start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`auth service running on port ${PORT}`);
});
