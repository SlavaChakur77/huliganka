import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function Chat() {
  const [msg, setMsg] = useState('');
  const [msgs, setMsgs] = useState([]);

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMsgs(prev => [...prev, data]);
    });
  }, []);

  const send = () => {
    if (msg.trim() === '') return;
    socket.emit('send_message', { user: 'Ты', message: msg });
    setMsg('');
  };

  return (
    <div>
      <h2>💬 Чат Amorus</h2>
      <div className="chat-box">
        {msgs.map((m, i) => (
          <p key={i}><b>{m.user}:</b> {m.message}</p>
        ))}
      </div>
      <input
        value={msg}
        onChange={e => setMsg(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && send()}
        placeholder="Напиши сообщение..."
      />
      <button onClick={send}>Отправить</button>
    </div>
  );
}

export default Chat;
