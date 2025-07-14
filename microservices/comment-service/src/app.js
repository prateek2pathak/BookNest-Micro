import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import commentRoutes from './routes/commentRoutes.js';

dotenv.config({ quiet: true });

const app = express();

// connect to database
connectDB();

// middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// routes
app.use('/api/comments', commentRoutes);

// health check
app.get('/health', (req, res) => {
  res.json({ service: 'comment-service', status: 'healthy' });
});

// start server
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`comment service running on port ${PORT}`);
});
