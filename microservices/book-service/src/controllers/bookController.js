import Book from '../models/book.js';

class BookController {
  async createBook(req, res) {
    try {
      const { title, author, genre, publishedDate, description } = req.body;
      const imageUrl = req.file ? req.file.path : undefined;
      const book = new Book({ 
        title, 
        author, 
        genre, 
        publishedDate, 
        description, 
        imageUrl,
        createdBy: req.user.id 
      });
      await book.save();
      res.status(201).json(book);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async getBooks(req, res) {
    try {
      const books = await Book.find().sort({ createdAt: -1 });
      res.json(books);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async getBookById(req, res) {
    try {
      const book = await Book.findById(req.params.id);
      if (!book) return res.status(404).json({ message: 'book not found' });
      res.json(book);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async updateBook(req, res) {
    try {
      const updateData = { ...req.body };
      if (req.file) updateData.imageUrl = req.file.path;
      
      const book = await Book.findByIdAndUpdate(req.params.id, updateData, { new: true });
      if (!book) return res.status(404).json({ message: 'book not found' });
      
      res.json(book);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async deleteBook(req, res) {
    try {
      const book = await Book.findByIdAndDelete(req.params.id);
      if (!book) return res.status(404).json({ message: 'book not found' });
      res.json({ message: 'book deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

export default new BookController();
