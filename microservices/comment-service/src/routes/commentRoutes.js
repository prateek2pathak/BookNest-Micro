import express from 'express';
import CommentController from '../controllers/commentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// user & admin routes
router.post('/books/:bookId/comments', authenticate, authorize(['user', 'admin']), CommentController.addComment);
router.get('/books/:bookId/comments', authenticate, authorize(['user', 'admin']), CommentController.getComments);
router.delete('/:id', authenticate, authorize(['admin']), CommentController.deleteComment);

export default router;
