import React, { createContext, useContext, useEffect, useState } from 'react';
import { socket } from '../services/socket';

const SocketContext = createContext();

export const SocketProvider = ({ children, user }) => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    // SAFELY capture the ID regardless of how MongoDB/JWT formatted it
    const currentUserId = user?._id || user?.id;

    if (currentUserId) {
      socket.connect();

      socket.on('connect', () => {
        setIsConnected(true);
        // Register user ID and role for targeted room routing
        socket.emit('setup_user', { userId: currentUserId, role: user.role });
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });

      socket.on('new_complaint_alert', (data) => {
        setNotifications((prev) => [data, ...prev]);
      });

      // Student alert: Complaint status updated
      socket.on('status_change_alert', (data) => {
        console.log("⚡ Live Status Update Received:", data); // <-- Added log for debugging
        setNotifications((prev) => [data, ...prev]);
      });

      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('new_complaint_alert');
        socket.off('status_change_alert');
        socket.disconnect();
      };
    } else {
      socket.disconnect();
    }
  }, [user]);

  const clearNotifications = () => setNotifications([]);

  return (
    <SocketContext.Provider value={{ socket, notifications, isConnected, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);