import express from 'express';
import { 
  getSystemStats, 
  getPendingAdmins, 
  approveAdmin, 
  rejectAdmin,
  getAllAdmins,
  deleteAdmin
} from '../controllers/superAdminController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getSystemStats);
router.get('/pending-admins', getPendingAdmins);
router.put('/approve-admin/:id', approveAdmin);
router.delete('/reject-admin/:id', rejectAdmin);

// Personnel Management Routes
router.get('/admins', getAllAdmins);
router.delete('/admins/:id', deleteAdmin);

export default router;