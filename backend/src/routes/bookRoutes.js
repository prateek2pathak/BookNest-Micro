import express from 'express';
import BookController from '../controllers/bookController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/', authenticate, authorize(['admin']), upload.single('image'), BookController.createBook);
router.put('/:id', authenticate, authorize(['admin']), upload.single('image'), BookController.updateBook);
router.delete('/:id', authenticate, authorize(['admin']), BookController.deleteBook);

router.get('/', authenticate, authorize(['user', 'admin']), BookController.getBooks);
router.get('/:id', authenticate, authorize(['user', 'admin']), BookController.getBookById);
router.post('/:id/comments', authenticate, authorize(['user', 'admin']), BookController.addComment);
router.get('/:id/comments', authenticate, authorize(['user', 'admin']), BookController.getComments);

export default router;