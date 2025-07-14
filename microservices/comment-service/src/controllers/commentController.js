import Comment from '../models/comment.js';

class CommentController {
  async addComment(req, res) {
    try {
      const { bookId } = req.params;
      const { text } = req.body;
      
      const comment = new Comment({
        bookId,
        user: req.user.username, // Get user from authenticated token
        text,
        date: new Date()
      });
      
      await comment.save();
      res.status(201).json(comment);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async getComments(req, res) {
    try {
      const { bookId } = req.params;
      const comments = await Comment.find({ bookId }).sort({ date: -1 });
      res.json(comments);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async deleteComment(req, res) {
    try {
      const comment = await Comment.findByIdAndDelete(req.params.id);
      if (!comment) return res.status(404).json({ message: 'comment not found' });
      res.json({ message: 'comment deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

export default new CommentController();
