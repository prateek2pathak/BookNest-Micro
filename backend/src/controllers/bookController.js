import Book from '../models/book.js';

class BookController {
  async createBook(req, res) {
    try {
      const { title, author, genre, publishedDate, description } = req.body;
      const imageUrl = req.file ? req.file.path : undefined;
      const book = new Book({ title, author, genre, publishedDate, description, imageUrl });
      await book.save();
      res.status(201).json(book);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getBooks(req, res) {
    try {
      const books = await Book.find();
      res.status(200).json(books);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getBookById(req, res) {
    try {
      const book = await Book.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.status(200).json(book);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateBook(req, res) {
    try {
      const updateData = { ...req.body };
      if (req.file) updateData.imageUrl = req.file.path;
      const book = await Book.findByIdAndUpdate(req.params.id, updateData, { new: true });
      res.json(book);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteBook(req, res) {
    try {
      const book = await Book.findByIdAndDelete(req.params.id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async addComment(req, res) {
    try {
      const { user, text } = req.body;
      const book = await Book.findById(req.params.id);
      if (!book) return res.status(404).json({ message: 'Book not found' });

      book.comments.push({ user, text });
      await book.save();
      res.status(201).json(book.comments);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getComments(req, res) {
    try {
      const book = await Book.findById(req.params.id);
      if (!book) return res.status(404).json({ message: 'Book not found' });

      res.status(200).json(book.comments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new BookController();