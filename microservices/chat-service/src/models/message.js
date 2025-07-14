import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  room: { type: String, required: true },
  username: { type: String, required: true },
  message: { type: String, required: true },
  time: { type: String, required: true }
}, { 
  timestamps: true,
  capped: {
    size: 1048576,
    max: 1000    
  }
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
