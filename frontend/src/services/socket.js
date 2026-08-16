import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create a socket instance but don't auto-connect; `SocketContext` controls connection lifecycle.
export const socket = io(API_BASE, { autoConnect: false });

export default socket;
