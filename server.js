
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

// Temporarily allow any origin for debugging (NOT for production).
// Using `origin: true` reflects the request origin and works with credentials.
// Revert this to a specific allowlist once testing is complete.
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Load environment variables from .env (if present)
dotenv.config();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Allow requests from any origin for debugging. Remove/refine before production.
app.use(cors({
  origin: true,
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
