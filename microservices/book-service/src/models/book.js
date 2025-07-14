import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String, required: true },
  publishedDate: { type: Date, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  createdBy: { type: String, required: true } // user id from auth service
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);

export default Book;
