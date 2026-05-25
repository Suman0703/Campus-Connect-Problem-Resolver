import express from 'express';
import { registerUser, loginUser, getApprovedAdmins } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected route allowing logged-in students to fetch the admin directory
router.get('/admins', protect, getApprovedAdmins);

export default router;