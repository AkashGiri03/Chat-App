
import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './models/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

import chatController from './controllers/chatController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Allowed frontend origins (add your Vercel URL and localhost for dev)
const allowedOrigins = [
  'https://chat-app-yb44.vercel.app',
  'https://chat-app.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

// Create Socket.io server with CORS configured so browser clients can connect
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Load environment variables from .env (if present)
dotenv.config();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true
}));


// MongoDB connection
connectDB();

// Socket.io controller
chatController(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
