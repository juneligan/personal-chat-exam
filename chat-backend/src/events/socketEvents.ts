import { Server, Socket } from 'socket.io';
import { prisma } from '../prisma/client';

// Event handler for a new socket connection
export const socketEvents = (socket: Socket, io: Server) => {
    // Listen for a user joining a room
    socket.on('joinRoom', (roomId: string) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room: ${roomId}`);

        // Broadcast that a new user has joined the room
        io.to(roomId).emit('userJoined', `User ${socket.id} has joined the room`);
    });

    // Listen for a message sent to the room
    socket.on('sendMessage', async (roomId: string, message: string) => {
        console.log(`Message from ${socket.id} in room ${roomId}: ${message}`);

        // Store the message in the database (optional)
        await prisma.message.create({
            data: {
                roomId: Number(roomId),
                userId: Number(socket.id),
                content: message,
                createdAt: new Date()
            }
        });

        // Broadcast message to all users in the room
        io.to(roomId).emit('receiveMessage', {
            senderId: socket.id,
            content: message,
            createdAt: new Date()
        });
    });

    // Handle socket disconnection
    socket.on('disconnect', () => {
        console.log(`User ${socket.id} disconnected`);
    });
};
