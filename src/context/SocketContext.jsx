import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { SocketContext } from '../hooks/useSocket';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (token) {
      const newSocket = io("http://localhost:5000", {
        auth: {
          token: token
        }
      });
      
      setSocket(newSocket);

      return () => newSocket.close();
    } else {
      // If no token, close existing socket
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
