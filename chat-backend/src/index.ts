import dotenv from 'dotenv';
dotenv.config(); // Load env vars FIRST

import express from 'express';
import http from 'http';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { setupSocketIO } from './events/socket';
import userRoutes from './routes/userRoutes';

const prisma = new PrismaClient();

interface AuthenticatedSocket extends Socket {
    userId?: number;
}

const allowedOrigins = [
    'http://localhost:5173', // Local development frontend
    process.env.PROD_FE_URL
];
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/', (_req, res) => {
    res.send('Chat API running');
});

// 🔌 Wire up real-time events
setupSocketIO(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
