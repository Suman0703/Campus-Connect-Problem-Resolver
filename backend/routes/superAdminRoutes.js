import express from 'express';
import { getSystemStats, getPendingAdmins, approveAdmin, rejectAdmin } from '../controllers/superAdminController.js';
import { protect, isSuperAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply BOTH middlewares: Must be logged in AND be the superadmin
router.use(protect, isSuperAdmin);

router.get('/stats', getSystemStats);
router.get('/pending-admins', getPendingAdmins);
router.put('/approve-admin/:id', approveAdmin);
router.delete('/reject-admin/:id', rejectAdmin);

export default router;