import { useEffect, useMemo, useState, useRef } from 'react';
import io from 'socket.io-client';
import ChatRoom from '../components/ChatRoom';

export default function Chat() {
  const [rooms, setRooms] = useState<string[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  console.log('Token:', token);
  console.log('User ID:', userId);

  // Memoize socket to avoid reconnecting unnecessarily
  const socket = useMemo(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    console.log('Connecting to socket server at:', apiUrl);

    const socketInstance = io(apiUrl, {
      auth: {
        token,
        userId
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected successfully with ID:', socketInstance.id);

      // Test the ping functionality when connection is established
      socketInstance.emit('ping', (response: string) => {
        console.log(`🏓 Ping response: ${response}`);
      });
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    socketInstance.on('disconnect', (reason) => {
      console.warn('⚠️ Disconnected:', reason);
    });

    // Add generic error handlers from socket-test
    socketInstance.on('messageError', (error) => {
      console.error('❌ Message error:', error);
    });

    socketInstance.on('roomError', (error) => {
      console.error('❌ Room error:', error);
    });

    return socketInstance;
  }, [token, userId]);

  const isMounted = useRef(true);
  useEffect(() => {
    // Test socket connection
    socket.emit('ping', (response: any) => {
      console.log('Ping response:', response);
    });

    setRooms(['general', 'random', 'dev']);

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      // console.log('Disconnecting socket');
      // socket.disconnect();

      // Only disconnect when component is unmounting
      // if (isUnmounting) {
      //   isMounted.current = false;
      //   socket.disconnect();
      // }
    };
  }, [socket]);

  return (
    <div style={{ display: 'flex' }}>
      <aside style={{ width: '200px', borderRight: '1px solid #ccc' }}>
        <h3>Rooms</h3>
        {rooms.map((room) => (
          <div
            key={room}
            style={{
              padding: '10px',
              background: activeRoom === room ? '#eee' : '',
              cursor: 'pointer',
            }}
            onClick={() => setActiveRoom(room)}
          >
            {room}
          </div>
        ))}
      </aside>

      <main style={{ flex: 1, padding: '1rem' }}>
        {activeRoom ? (
          <ChatRoom room={activeRoom} socket={socket} />
        ) : (
          <p>Select a room to chat</p>
        )}
      </main>
    </div>
  );
}
