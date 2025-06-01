import { useEffect, useRef } from 'react';

interface Props {
    messages: {
        sender: string;
        content: string;
        timestamp: string;
    }[];
}

export default function MessageList({ messages }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div
            ref={containerRef}
            style={{ maxHeight: '400px', overflowY: 'auto' }}
        >
            {messages.map((msg, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                    <strong>{msg.sender}</strong>: {msg.content}
                    <br />
                    <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
                </div>
            ))}
        </div>
    );
}
