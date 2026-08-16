import express from 'express';
import { 
  createComplaint, 
  getMyComplaints, 
  updateComplaintStatus 
} from '../controllers/complaintController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Student routes (supports both /my and /my-complaints)
router.post('/', protect, upload.single('image'), createComplaint);
router.get('/my', protect, getMyComplaints);
router.get('/my-complaints', protect, getMyComplaints);

// Admin status update route
router.put('/:id/status', protect, isAdmin, updateComplaintStatus);

export default router;