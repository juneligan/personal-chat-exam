interface Props {
    messages: {
        sender: string;
        content: string;
        timestamp: string;
    }[];
}

export default function MessageList({ messages }: Props) {
    return (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
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
