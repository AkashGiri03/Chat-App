import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  username: String,
  profilePic: String,
  content: String,
  timestamp: Date,
  room: String
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
