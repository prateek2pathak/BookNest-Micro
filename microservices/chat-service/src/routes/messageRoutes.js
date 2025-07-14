import express from 'express';
import messageController from '../controllers/messageController.js';

const router = express.Router();

router.get('/', messageController.getMessagesByRoom);

router.get('/genres', messageController.getAvailableGenres);


router.get('/room/:room/recent', messageController.getRecentMessages);

router.delete('/:messageId', messageController.deleteMessage);

export default router;
