import express from 'express';
import { getAllComplaints, getAssignedComplaints, updateComplaintStatus } from '../controllers/adminController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import { getAllStudents, deleteStudent } from '../controllers/adminController.js';

const router = express.Router();

router.use(protect, isAdmin);

// Fetch the personal assigned inbox
router.get('/complaints/assigned', getAssignedComplaints);

// Fetch all general inbox
router.get('/complaints', getAllComplaints);

router.put('/complaints/:id/status', updateComplaintStatus);
router.get('/students', protect, isAdmin, getAllStudents);
router.delete('/students/:id', protect, isAdmin, deleteStudent);

export default router;