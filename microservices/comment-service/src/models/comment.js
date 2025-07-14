import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  bookId: { type: String, required: true },
  user: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
