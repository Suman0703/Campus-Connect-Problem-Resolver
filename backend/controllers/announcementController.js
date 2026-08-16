import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Announcement from '../models/Announcement.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Create a new announcement / directive
// @route   POST /api/announcements
// @access  Private (Admin / Super Admin)
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority, targetAudience } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    let attachmentPath = null;
    let fileType = null;
    let originalFileName = null;

    if (req.file) {
      attachmentPath = `/uploads/${req.file.filename}`;
      originalFileName = req.file.originalname;
      fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'document';
    }

    const adminId = req.user?._id || req.user?.id;

    const announcement = new Announcement({
      title,
      content,
      priority: priority || 'Normal',
      targetAudience: targetAudience || 'all',
      admin: adminId,
      attachment: attachmentPath,
      fileType,
      originalFileName
    });

    const savedAnnouncement = await announcement.save();

    // Reliably retrieve fully populated document across all Mongoose versions
    const populatedAnnouncement = await Announcement.findById(savedAnnouncement._id)
      .populate('admin', '_id id firstName lastName role email department');

    // Trigger Real-Time WebSocket Notification
    const io = req.app.get('io');
    if (io) {
      const adminName = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || 'Administration';
      
      io.emit('new_announcement_alert', {
        ...populatedAnnouncement.toObject(),
        adminName,
        message: `New Notice: "${populatedAnnouncement.title}" posted by ${adminName}`
      });
    }

    return res.status(201).json(populatedAnnouncement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    return res.status(500).json({ message: 'Failed to create announcement', error: error.message });
  }
};

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Public / Private
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({})
      .populate('admin', '_id id firstName lastName role email department')
      .sort({ createdAt: -1 });

    return res.status(200).json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return res.status(500).json({ message: 'Failed to fetch announcements', error: error.message });
  }
};

// @desc    Delete announcement & clean up attached file from disk
// @route   DELETE /api/announcements/:id
// @access  Private (Admin / Super Admin)
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Delete attached physical file from /uploads if it exists
    if (announcement.attachment) {
      const filePath = path.join(__dirname, '..', announcement.attachment);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (fsErr) {
          console.warn('Could not delete attachment file from disk:', fsErr.message);
        }
      }
    }

    await announcement.deleteOne();
    return res.status(200).json({ message: 'Announcement deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return res.status(500).json({ message: 'Failed to delete announcement', error: error.message });
  }
};