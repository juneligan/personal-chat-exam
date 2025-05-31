import { useEffect, useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Socket } from 'socket.io-client';

interface Props {
    room: string;
    socket: Socket;
}

interface Message {
    sender: string;
    content: string;
    timestamp: string;
}

export default function ChatRoom({ room, socket }: Props) {
    const [messages, setMessages] = useState<Message[]>([]);

    const [sendStatus, setSendStatus] = useState<{success: boolean, messageId?: string} | null>(null);

    useEffect(() => {
        console.log('Setting up socket listeners for room:', room);
        
        // Join the room - use the simple string format as in socket-test.ts
        // socket.emit('joinRoom', room, (err: any) => {
        //     if (err) {
        //         console.error('❌ Error joining room:', err);
        //     } else {
        //         console.log(`✅ Successfully joined room: ${room}`);
        //     }
        // });

        // Listen for message history
        socket.on('messageHistory', (msgs: Message[]) => {
            console.log('📚 Received message history:', msgs);
            setMessages(msgs);
        });
        // Make sure socket is connected before joining room
        if (socket.connected) {
            joinRoom();
        } else {
            socket.once('connect', joinRoom);
        }

        function joinRoom() {
            console.log(`Attempting to join room: ${room} (socket ID: ${socket.id})`);
            socket.emit('joinRoom', room, (err: Error | null) => {
                if (err) {
                    console.error('❌ Error joining room:', err);
                } else {
                    console.log(`✅ Successfully joined room: ${room}`);
                }
            });
        }

        // Listen for new messages
        socket.on('newMessage', (msg: Message | Message[]) => {
            console.log('📨 New message received:', msg);
            if (Array.isArray(msg)) {
                setMessages((prev) => [...prev, ...msg]);
            } else {
                setMessages((prev) => [...prev, msg]);
            }
        });

        // Add user joined/left events like in socket-test
        socket.on('userJoined', (data: {username: string}) => {
            console.log(`👋 User joined: ${data.username}`);
        });

        socket.on('userLeft', (data: {username: string}) => {
            console.log(`👋 User left: ${data.username}`);
        });

        socket.on('messageSent', (response: {success: boolean, messageId: string}) => {
            console.log('✅ Message sent confirmation:', response);
            setSendStatus(response);
            setTimeout(() => setSendStatus(null), 3000);
        });

        socket.on('messageError', (error: {success: boolean, error: string}) => {
            console.error('❌ Message error:', error);
            setSendStatus({success: false});
            setTimeout(() => setSendStatus(null), 3000);
        });

        socket.on('roomError', (error: {message: string}) => {
            console.error('❌ Room error:', error);
        });

        socket.on('connect_error', (error) => {
            console.error('❌ Connection error:', error);
        });

        // Test connection with ping like in socket-test
        socket.emit('ping', (response: string) => {
            console.log(`🏓 Ping response: ${response}`);
        });

        return () => {
            console.log(`🚶 Leaving room: ${room}`);
            socket.emit('leaveRoom', room);
            socket.off('messageHistory');
            socket.off('newMessage');
            socket.off('messageSent');
            socket.off('messageError');
            socket.off('roomError');
            socket.off('userJoined');
            socket.off('userLeft');
            socket.off('connect_error');
        };
    }, [room, socket]);

    const handleSend = (content: string) => {
        console.log('📤 Sending message:', content);
        if (!content.trim()) return;
        
        // Create message object that matches what the backend expects
        const message = {
            content: content,
            room: room,
            sender: localStorage.getItem('username') || 'Anonymous',
            timestamp: new Date().toISOString()
        };

        console.log('📤 Sending message:', message);
        
        // Use the approach from socket-test.ts - without callback initially
        // socket.emit('sendMessage', message, (response: string) => {
        //     console.log(`🏓---------- sendMessage response: ${response}`);
        // });
        
        // Log that we attempted to send a message
        console.log(`Sent message to room: ${room}, content: ${content}`);
        
        // For debugging, also try with a callback
        // socket.emit('sendMessage', message, (response: any) => {
        //     console.log('Message send callback response:', response);
        //     if (response && typeof response === 'object') {
        //         setSendStatus(response);
        //         setTimeout(() => setSendStatus(null), 3000);
        //     }
        // });
        if (socket.connected) {
            sendMessage(message);
        } else {
            console.log('Socket status before sending:', {
                id: socket.id,
                connected: socket.connected,
                disconnected: socket.disconnected
            });
            console.log('Socket not connected, waiting...');
            socket.once('connect', () => sendMessage(message));
        }

        function sendMessage(msg: any) {
            console.log(`Socket connected (${socket.id}), sending message now`);
            socket.emit('sendMessage', msg, (response: { success: boolean, messageId?: string }) => {
                console.log('Message send callback response:', response);
                if (response && typeof response === 'object') {
                    setSendStatus(response);
                    setTimeout(() => setSendStatus(null), 3000);
                }
            });
        }
    };

    return (
        <>
            <h2>Room: {room}</h2>
            <MessageList messages={messages} />
            {sendStatus && (
                <div style={{
                    color: sendStatus.success ? 'green' : 'red',
                    padding: '5px',
                    marginBottom: '10px'
                }}>
                    {sendStatus.success
                        ? `Message sent successfully${sendStatus.messageId ? ` (ID: ${sendStatus.messageId})` : ''}`
                        : 'Failed to send message'}
                </div>
            )}
            <MessageInput onSend={handleSend} />
        </>
    );
}
