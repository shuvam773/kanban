import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { SocketContext } from '../hooks/useSocket';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const token = useSelector((state) => state.auth.token);

  const connectSocket = useCallback(() => {
    if (token) {
      const newSocket = io("http://localhost:5000", {
        auth: { token },
        // Add reconnection options
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
      });

      newSocket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`Reconnection attempt ${attemptNumber}`);
      });

      newSocket.on('reconnect_failed', () => {
        console.log('Failed to reconnect');
        // Try to reconnect manually after all attempts fail
        setTimeout(() => {
          if (!isConnected) {
            connectSocket();
          }
        }, 5000);
      });

      newSocket.on('connect_error', (error) => {
        console.log('Connection error:', error);
      });
      
      setSocket(newSocket);
      return newSocket;
    }
    return null;
  }, [token, isConnected]);

  useEffect(() => {
    let currentSocket = null;
    if (token) {
      currentSocket = connectSocket();
    } else {
      // If no token, close existing socket
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }

    return () => {
      if (currentSocket) {
        currentSocket.close();
      }
    };
  }, [token, connectSocket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
