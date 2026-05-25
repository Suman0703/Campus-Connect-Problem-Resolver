import express from 'express';
import { createAnnouncement, getAnnouncements } from '../controllers/announcementController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// GET all announcements (Students and Admins)
router.get('/', protect, getAnnouncements);

// POST new announcement (Admins Only, with file upload capability)
router.post('/', protect, isAdmin, upload.single('attachment'), createAnnouncement);

export default router;