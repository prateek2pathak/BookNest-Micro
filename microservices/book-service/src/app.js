import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import bookRoutes from './routes/bookRoutes.js';

dotenv.config({ quiet: true });

const app = express();

connectDB();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// routes
app.use('/api/books', bookRoutes);

// health check
app.get('/health', (req, res) => {
  res.json({ service: 'book-service', status: 'healthy' });
});

// start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`book service running on port ${PORT}`);
});
