import Message from '../models/Message.js';

const onlineUsers = {};

export default function(io) {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    socket.on('join', async ({ username, profilePic, room }) => {
      console.log(`${username} joining room: ${room} (socket ${socket.id})`);
      try {
        onlineUsers[socket.id] = { username, profilePic, room };
        socket.join(room);
        const messages = await Message.find({ room }).sort({ timestamp: 1 }).limit(100);
        const usersInRoom = Object.values(onlineUsers).filter(u => u.room === room);
        io.to(room).emit('userList', usersInRoom);
        socket.emit('chatHistory', messages);
        io.to(room).emit('userJoined', { username, profilePic });
      } catch (err) {
        console.error('Error in join:', err);
      }
    });

    socket.on('message', async (msg) => {
      console.log('Received message event:', msg);
      const user = onlineUsers[socket.id];
      if (!user || user.room !== msg.room) return;
      const message = new Message({
        username: user.username || 'Unknown',
        profilePic: user.profilePic || '',
        content: msg.content,
        timestamp: new Date(),
        room: msg.room
      });
      await message.save();
      io.to(msg.room).emit('message', message);
    });

    socket.on('typing', (username) => {
      const user = onlineUsers[socket.id];
      if (user && user.room) {
        socket.to(user.room).emit('typing', username);
      }
    });

    socket.on('stopTyping', (username) => {
      const user = onlineUsers[socket.id];
      if (user && user.room) {
        socket.to(user.room).emit('stopTyping', username);
      }
    });

    socket.on('disconnect', () => {
      const user = onlineUsers[socket.id];
      if (user && user.room) {
        delete onlineUsers[socket.id];
        const usersInRoom = Object.values(onlineUsers).filter(u => u.room === user.room);
        io.to(user.room).emit('userList', usersInRoom);
        io.to(user.room).emit('userLeft', user.username);
      }
    });
  });
}
