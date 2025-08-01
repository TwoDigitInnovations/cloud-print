

import React, { useEffect } from 'react';
import socket from './services/socket';

function App() {
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
        socket.emit('printcommand', 'https://m.media-amazon.com/images/I/71+17bVYHxL._UF1000,1000_QL80_.jpg');
      }}>Print</button>
    </div>
  );
}





// import { BrowserRouter as Router } from 'react-router-dom';
// import Tab1 from './pages/Tab1';
// // ...
// function App() {
//   return (
//     <Router>
//       <Tab1 />
//     </Router>
//   )
// }

export default App;