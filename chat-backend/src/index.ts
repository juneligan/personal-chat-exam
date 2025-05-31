import dotenv from 'dotenv';
dotenv.config(); // Load env vars FIRST

import express from 'express';
import http from 'http';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import { socketEvents } from './events/socketEvents';  // Import the socket events
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { setupSocketIO } from './socket';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
    userId?: number;
}


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (_req, res) => {
    res.send('Chat API running');
});

// WebSocket events
// 🔌 Wire up real-time events
setupSocketIO(io);
// io.use((socket, next) => {
//     const token = socket.handshake.auth.token;
//
//     if (!token) return next(new Error('Authentication error: Token missing'));
//
//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
//         (socket as AuthenticatedSocket).userId = decoded.userId;
//         next();
//     } catch (err) {
//         next(new Error('Authentication error: Invalid token'));
//     }
// });
//
// io.on('connection', (socket: AuthenticatedSocket) => {
//     console.log('✅ Authenticated socket:', socket.id, 'User:', socket.userId);
//
//     socket.on('sendMessage', async ({ roomId, content }) => {
//         if (!socket.userId) return;
//
//         const message = await prisma.message.create({
//             data: {
//                 content,
//                 roomId,
//                 userId: socket.userId
//             },
//             include: { user: true }
//         });
//
//         io.to(roomId.toString()).emit('newMessage', {
//             id: message.id,
//             content: message.content,
//             user: {
//                 id: message.user.id,
//                 name: message.user.username
//             },
//             createdAt: message.createdAt
//         });
//     });
//
//     socket.on('joinRoom', (roomId: number) => {
//         socket.join(roomId.toString());
//         console.log(`User ${socket.userId} joined room ${roomId}`);
//     });
//
//     socket.on('disconnect', () => {
//         console.log('User disconnected:', socket.id);
//     });
// });

// io.on('connection', (socket) => {
//     console.log('User connected:', socket.id);
//
//     // Use the socket events from the event file
//     socketEvents(socket, io);
//
//     socket.on('disconnect', () => {
//         console.log('User disconnected:', socket.id);
//     });
// });

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
