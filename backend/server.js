import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http'; // <-- Import HTTP module
import { Server } from 'socket.io'; // <-- Import Socket.io Server

// Route Imports
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import superAdminRoutes from './routes/superAdminRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';

// Socket Handler Import
import initSocket from './socket/socketHandler.js'; // <-- Import socket logic

dotenv.config();
connectDB();

const app = express();

// Create HTTP server for WebSockets
const server = http.createServer(app); 

// Allowed Frontend URLs
const allowedOrigins = [
  "http://localhost:5173",
  "https://campus-connect-problem-resolver.vercel.app"
];

// Initialize Socket.io with CORS matching your Express setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
  }
});

// Make `io` accessible globally inside your controllers (e.g., complaintRoutes)
app.set('io', io);

// Initialize Socket logic (rooms, connections)
initSocket(io);

// CORS Middleware for Express
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());

// Serve uploads folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/announcements', announcementRoutes);

app.get('/', (req, res) => {
  res.send('Campus Connect API with WebSockets is running...');
});

const PORT = process.env.PORT || 5000;

// IMPORTANT: Change app.listen to server.listen so WebSockets work
server.listen(PORT, () => {
  console.log(`🚀 Server running with WebSockets on port ${PORT}`);
});