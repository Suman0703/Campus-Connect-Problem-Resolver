import express from 'express';
import { createAnnouncement, getAnnouncements, deleteAnnouncement } from '../controllers/announcementController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', protect, getAnnouncements);
router.post('/', protect, isAdmin, upload.single('attachment'), createAnnouncement);

// NEW: Delete Route
router.delete('/:id', protect, isAdmin, deleteAnnouncement);

export default router;