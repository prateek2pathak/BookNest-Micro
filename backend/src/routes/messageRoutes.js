import express from 'express';
import Message from '../models/message.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { room } = req.query;
  const messages = await Message.find({ room }).sort({ _id: 1 });
  res.json({ messages });
});

export default router;