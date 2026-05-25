import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import adminRoutes from './routes/adminRoutes.js';           // <-- ADDED ADMIN ROUTES
import superAdminRoutes from './routes/superAdminRoutes.js'; // <-- ADDED SUPER ADMIN ROUTES

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Serve the 'uploads' folder statically for images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// API Routes
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);             // <-- CONNECTED ADMIN API
app.use('/api/superadmin', superAdminRoutes);   // <-- CONNECTED SUPER ADMIN API

// Default route
app.get('/', (req, res) => {
  res.send('Campus Connect API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});