// socket-test.ts
import { io } from 'socket.io-client';
import jwt from 'jsonwebtoken';

// Create a token with the expected payload format (userId and username)
const token = jwt.sign({ 
  userId: "1", 
  username: "TestUser" 
}, process.env.JWT_SECRET || 'supersecretkey');

console.log('🔑 Generated token:', token);

const socket = io('http://localhost:5000', {
    auth: {
        token: token
    }
});

socket.on('connect', () => {
    console.log('✅ Connected to socket server!');
    
    // Join a room using string format as expected by the backend
    const roomName = 'test-room';
    console.log(`🚪 Joining room: ${roomName}`);
    socket.emit('joinRoom', roomName);
    
    // Send a test message after joining the room
    setTimeout(() => {
        const message = {
            content: 'Hello from test client!',
            room: roomName
        };
        console.log(`📤 Sending message:`, message);
        socket.emit('sendMessage', message);
    }, 1000);
    
    // Send additional test messages at intervals
    let msgCount = 1;
    const interval = setInterval(() => {
        const message = {
            content: `Test message #${msgCount}`,
            room: roomName
        };
        console.log(`📤 Sending message:`, message);
        socket.emit('sendMessage', message);
        
        msgCount++;
        if (msgCount > 5) {
            clearInterval(interval);
            console.log('📝 Finished sending test messages');
            
            // Test the ping functionality
            socket.emit('ping', (response: string) => {
                console.log(`🏓 Ping response: ${response}`);
            });
            
            // Leave the room after all messages are sent
            setTimeout(() => {
                console.log(`🚶 Leaving room: ${roomName}`);
                socket.emit('leaveRoom', roomName);
            }, 2000);
        }
    }, 2000);
});

socket.on('messageHistory', (messages) => {
    console.log('📚 Received message history:', messages);
});

socket.on('messageSent', (confirmation) => {
    console.log('✅ Message sent confirmation:', confirmation);
});

socket.on('newMessage', (msg) => {
    console.log('📨 New message received:', msg);
});

socket.on('userJoined', (data) => {
    console.log(`👋 User joined: ${data.username}`);
});

socket.on('userLeft', (data) => {
    console.log(`👋 User left: ${data.username}`);
});

socket.on('messageError', (error) => {
    console.error('❌ Message error:', error);
});

socket.on('roomError', (error) => {
    console.error('❌ Room error:', error);
});

socket.on('connect_error', (err) => {
    console.error('❌ Connection error:', err.message);
});

socket.on('disconnect', (reason) => {
    console.warn('⚠️ Disconnected:', reason);
});
