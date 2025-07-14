import Message from '../models/message.js';

class MessageController {

  async getMessagesByRoom(req, res) {
    try {
      const { room } = req.query;
      const messages = await Message.find({ room }).sort({ _id: 1 });
      res.json({ messages });
    } catch (error) {
      console.error('Error fetching messages by room:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  async getAvailableGenres(req, res) {
    try {
      const allGenres = [
        'Fantasy',
        'Science Fiction',
        'Mystery',
        'Romance',
        'Non-Fiction'
      ];
      res.json(allGenres);
    } catch (error) {
      console.error('Error fetching available genres:', error);
      res.status(500).json({ error: 'Failed to fetch genres' });
    }
  }

  async deleteMessage(req, res) {
    try {
      const { messageId } = req.params;
      
      const deletedMessage = await Message.findByIdAndDelete(messageId);
      
      if (!deletedMessage) {
        return res.status(404).json({ error: 'Message not found' });
      }
      
      res.json({ message: 'Message deleted successfully', deletedMessage });
    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(500).json({ error: 'Failed to delete message' });
    }
  }

  async getRecentMessages(req, res) {
    try {
      const { room } = req.params;
      const { page = 1, limit = 50 } = req.query;
      
      const messages = await Message.find({ room })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
      
      const totalMessages = await Message.countDocuments({ room });
      
      res.json({
        messages: messages.reverse(),
        totalMessages,
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit)
      });
    } catch (error) {
      console.error('Error fetching recent messages:', error);
      res.status(500).json({ error: 'Failed to fetch recent messages' });
    }
  }

}

export default new MessageController();
