import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma/client';

interface AuthPayload {
    userId: string;
    username: string;
}

interface MessageData {
    content: string;
    room: string;
}

export function setupSocketIO(io: Server) {
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;

        if (!token) {
            console.warn('❌ No token provided');
            return next(new Error('No token provided'));
        }

        try {
            const user = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
            socket.data.user = user; // Attach user to socket
            next(); // ✅ Allow connection
        } catch (err) {
            console.error('❌ Invalid JWT:', err);
            return next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        try {
            const user = socket.data.user as AuthPayload;
            console.log('✅ User connected:', socket.id, 'UserID:', user.userId, 'Username:', user.username);

            // Register event handlers
            registerSocketEventHandlers(socket, user);
        } catch (error) {
            console.error('❌ Error in connection handler:', error);
            socket.disconnect(true);
        }
    });

    function registerSocketEventHandlers(socket: any, user: AuthPayload) {
        socket.on('joinRoom', async (roomName: string) => {
            try {
                console.log(`🚪 Joining room request - User: ${user.username}, Room: ${roomName}`);

                if (!roomName || typeof roomName !== 'string') {
                    console.error('❌ Invalid room name:', roomName);
                    socket.emit('roomError', { error: 'Invalid room name' });
                    return;
                }

                socket.join(roomName);
                console.log(`✅ ${user.username} joined room ${roomName}`);

                const messages = await prisma.message.findMany({
                    where: { room: { name: roomName } },
                    include: { user: true },
                    orderBy: { createdAt: 'asc' },
                });

                console.log(`📚 Sending message history for room ${roomName}: ${messages.length} messages`);

                const formattedMessages = messages.map((m) => ({
                    sender: m.user.username,
                    content: m.content,
                    timestamp: m.createdAt.toISOString(),
                }));

                // Send message history as an array
                socket.emit('messageHistory', formattedMessages);

                // Notify others in the room that someone joined
                socket.to(roomName).emit('userJoined', { username: user.username });
            } catch (error) {
                console.error(`❌ Error handling joinRoom event:`, error);
                socket.emit('roomError', { error: 'Failed to join room' });
            }
        }, (callback) => {
            try {
                console.log('🏓 Received join room request from client');
                if (typeof callback === 'function') {
                    callback('joinRoom acknowledged');
                    console.log('🏓 Sent joinRoom acknowledged response');
                } else {
                    console.warn('⚠️ joinRoom acknowledged received but callback is not a function');
                }
            } catch (error) {
                console.error('❌ Error handling joinRoom acknowledged event:', error);
            }
        });

        socket.on('sendMessage', async (data: any) => {
            try {
                // Debug the raw received data
                console.log('📩 Raw received message data:', JSON.stringify(data));

                // Type checking and validation
                if (!data || typeof data !== 'object') {
                    console.error('❌ Invalid message format:', data);
                    socket.emit('messageError', { success: false, error: 'Invalid message format' });
                    return;
                }

                const { content, room } = data as MessageData;

                // More debug info
                console.log(`📨 Extracted content: "${content}", room: "${room}"`);

                if (!content || typeof content !== 'string') {
                    console.error('❌ Missing or invalid content:', content);
                    socket.emit('messageError', { success: false, error: 'Missing or invalid content' });
                    return;
                }

                if (!room || typeof room !== 'string') {
                    console.error('❌ Missing or invalid room:', room);
                    socket.emit('messageError', { success: false, error: 'Missing or invalid room' });
                    return;
                }

                if (!user) {
                    console.error('❌ User not authenticated');
                    socket.emit('messageError', { success: false, error: 'User not authenticated' });
                    return;
                }

                console.log(`📨 ${user.username} sending message to room ${room}: ${content}`);

                // Get or create the room
                const roomRecord = await prisma.room.upsert({
                    where: {name: room},
                    update: {},
                    create: {name: room},
                });

                // Create the message
                const saved = await prisma.message.create({
                    data: {
                        content: content,
                        userId: Number(user.userId),
                        roomId: roomRecord.id,
                    },
                    include: {
                        user: true,
                    },
                });

                console.log(`✅ Message saved successfully: ID ${saved.id}`);

                // Send delivery confirmation to the sender
                socket.emit('messageSent', {
                    success: true,
                    messageId: saved.id.toString()
                });

                // Prepare the message object
                const messageObject = {
                    sender: saved.user.username,
                    content: saved.content,
                    timestamp: saved.createdAt.toISOString(),
                };

                console.log(`🔄 Broadcasting message to room ${room}:`, JSON.stringify(messageObject));

                // Broadcast the message to everyone in the room
                io.to(room).emit('newMessage', messageObject);
            } catch (error) {
                console.error('❌ Error handling sendMessage event:', error);
                socket.emit('messageError', {
                    success: false,
                    error: 'Failed to process message'
                });
            }
        }, (callback) => {
            try {
                console.log('🏓 Received sendMessage request from client');
                if (typeof callback === 'function') {
                    callback('sendMessage acknowledged');
                    console.log('🏓 Sent sendMessage acknowledged response');
                } else {
                    console.warn('⚠️ sendMessage acknowledged received but callback is not a function');
                }
            } catch (error) {
                console.error('❌ Error handling sendMessage acknowledged event:', error);
            }
        });

        socket.on('ping', (callback) => {
            try {
                console.log('🏓 Received ping from client');
                if (typeof callback === 'function') {
                    callback('pong');
                    console.log('🏓 Sent pong response');
                } else {
                    console.warn('⚠️ Ping received but callback is not a function');
                }
            } catch (error) {
                console.error('❌ Error handling ping event:', error);
            }
        });

        socket.on('leaveRoom', (roomName: string) => {
            try {
                if (!roomName || typeof roomName !== 'string') {
                    console.error('❌ Invalid room name for leaving:', roomName);
                    return;
                }

                socket.leave(roomName);
                console.log(`🚶 ${user.username} left room ${roomName}`);

                // Notify others in the room that someone left
                socket.to(roomName).emit('userLeft', { username: user.username });
            } catch (error) {
                console.error('❌ Error handling leaveRoom event:', error);
            }
        });

        socket.on('disconnect', () => {
            try {
                console.log(`🔌 Socket disconnected: ${socket.id}, User: ${user.username}`);
            } catch (error) {
                console.error('❌ Error handling disconnect event:', error);
            }
        });

        socket.on('error', (error: any) => {
            console.error('❌ Socket error:', error);
        });
    }
}
