import { useState } from 'react';

export default function MessageInput({ onSend }: { onSend: (msg: string) => void }) {
    const [message, setMessage] = useState('');

    const handleSend = () => {

        if (!message.trim()) return;

        console.log('Input component sending message:', message);
        onSend(message);
        setMessage('');
    };

    return (
        <div style={{ display: 'flex', marginTop: '10px' }}>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                style={{ flex: 1, padding: '8px', marginRight: '8px' }}
                placeholder="Type a message..."
            />
            <button 
                onClick={handleSend}
                style={{ padding: '8px 16px' }}
                disabled={!message.trim()}
            >
                Send
            </button>
        </div>
    );
}
