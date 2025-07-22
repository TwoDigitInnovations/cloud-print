

import React, { useEffect } from 'react';
import socket from '../services/socket';

function Tab1() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket server:", socket.id);
      // alert(socket.id)
    });
    // Listen for messages
    socket.on('print', (msg: any) => {
      console.log('Received message:', msg);
    });

    // Send a message to the server
    socket.emit('chat-message', 'Hello from React + Vite + Electron!');

    // Cleanup on unmount
    return () => {
      socket.off('chat-message');
    };
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <button onClick={() => {
        console.log('printcommand', 'hello')
        socket.emit('printcommand', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTA2oASENe7GdCli1KnAl6cnDnuD6lGT60txQ&s');
      }}>Print</button>
    </div>
  );
}

export default Tab1;
