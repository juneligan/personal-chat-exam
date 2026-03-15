import { useEffect, useMemo, useState } from 'react';
import io from 'socket.io-client';
import ChatRoom from '../components/ChatRoom';

export default function Chat() {
  const [rooms, setRooms] = useState<string[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [users, setUsers] = useState<{ id: number; username: string }[]>([]);

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users`);
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error('Failed to load users', err);
      }
    };
    fetchUsers();
  }, []);

  function getDirectMessageRoom(userA: string, userB: string): string {
    // sort the username, to avoid creating new room for a DM type messaging
    return ['dm', ...[userA, userB].sort()].join('_');
  }

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

        <h3>Direct Messages</h3>
        {users.map((user) => {
          if (user.id.toString() === userId) return null; // Skip self
          const dmRoom = getDirectMessageRoom(user.username, localStorage.getItem('username')!);
          return (
              <div
                  key={user.id}
                  style={{
                    padding: '10px',
                    background: activeRoom === dmRoom ? '#eee' : '',
                    cursor: 'pointer',
                  }}
                  onClick={() => setActiveRoom(dmRoom)}
              >
                {user.username}
              </div>
          );
        })}
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
