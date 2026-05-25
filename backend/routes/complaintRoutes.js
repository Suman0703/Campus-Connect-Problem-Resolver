import express from 'express';
import { createComplaint, getMyComplaints } from '../controllers/complaintController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js'; // <-- Import Multer

const router = express.Router();

// CHAIN OF COMMAND: 
// 1. Verify User (protect) 
// 2. Process Image (upload.single) 
// 3. Save to Database (createComplaint)
router.post('/', protect, upload.single('image'), createComplaint);

// Get a student's personal complaints
router.get('/my-complaints', protect, getMyComplaints);

export default router;