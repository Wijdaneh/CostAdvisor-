import React, { useState, useRef, useEffect } from 'react';

const Chat = () => {
    const [messages, setMessages] = useState([
        { type: 'ai', text: 'Bonjour ! Je suis CostAdvisor. Posez-moi une question sur vos chiffres. (Ex: "Quel est le service le plus coûteux ?")', structured: null }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const res = await fetch('http://127.0.0.1:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });
            const data = await res.json();

            setMessages(prev => [...prev, { type: 'ai', text: data.text, structured: data.structured }]);
        } catch (err) {
            setMessages(prev => [...prev, { type: 'ai', text: "Désolé, je n'arrive pas à joindre le serveur pour le moment." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
                <h3 style={{ fontSize: '1.1rem' }}>Assistant Virtuel</h3>
            </div>

            <div ref={scrollRef} style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{
                        alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%'
                    }}>
                        {/* Bubble */}
                        <div style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            background: msg.type === 'user' ? 'var(--primary-gradient)' : 'rgba(255,255,255,0.1)',
                            borderBottomRightRadius: msg.type === 'user' ? '2px' : '12px',
                            borderTopLeftRadius: msg.type === 'ai' ? '2px' : '12px',
                            color: 'white',
                            lineHeight: '1.5'
                        }}>
                            {msg.text}
                        </div>

                        {/* Structured Output */}
                        {msg.structured && (
                            <div className="animate-fade-in" style={{
                                marginTop: '0.5rem',
                                padding: '1rem',
                                background: 'rgba(16, 185, 129, 0.1)', // Light Green tint
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '12px',
                                fontSize: '0.95rem'
                            }}>
                                {msg.structured.type === 'alert' && (
                                    <>
                                        <div style={{ fontWeight: 'bold', color: '#fca5a5', marginBottom: '0.5rem' }}>⚠️ Analyse</div>
                                        <ul style={{ listStyle: 'none', padding: 0 }}>
                                            <li style={{ marginBottom: '0.5rem' }}><strong>Cause :</strong> {msg.structured.cause}</li>
                                            <li style={{ marginBottom: '0.5rem' }}><strong>Impact :</strong> {msg.structured.impact}</li>
                                            <li><strong>Recommandation :</strong> {msg.structured.recommendation}</li>
                                        </ul>
                                    </>
                                )}
                                {msg.structured.type === 'good_news' && (
                                    <>
                                        <div style={{ fontWeight: 'bold', color: '#6ee7b7', marginBottom: '0.5rem' }}>✅ Analyse</div>
                                        <div style={{ marginBottom: '0.5rem' }}>{msg.structured.impact}</div>
                                        <div style={{ fontStyle: 'italic' }}>"{msg.structured.recommendation}"</div>
                                    </>
                                )}
                                {msg.structured.type === 'list' && (
                                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                                        {msg.structured.items.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                        <span style={{ animation: 'pulse 1.5s infinite' }}>...</span>
                    </div>
                )}
            </div>

            <form onSubmit={sendMessage} style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '0.5rem' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Posez une question..."
                    disabled={loading}
                    style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '0.8rem',
                        color: 'white',
                        outline: 'none'
                    }}
                />
                <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
                    ➤
                </button>
            </form>
            <style>{`
                @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 1; } 100% { opacity: 0.3; } }
            `}</style>
        </div>
    );
};

export default Chat;
