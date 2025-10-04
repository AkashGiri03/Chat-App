
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './models/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

import chatController from './controllers/chatController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


// MongoDB connection
connectDB();

// Socket.io controller
chatController(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
