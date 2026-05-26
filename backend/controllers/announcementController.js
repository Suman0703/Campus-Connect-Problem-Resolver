import Announcement from '../models/Announcement.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Create a new announcement
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority } = req.body;
    let attachmentPath = null;
    let fileCategory = null;
    let originalName = null;

    if (req.file) {
      attachmentPath = `/uploads/${req.file.filename}`;
      originalName = req.file.originalname;
      
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (ext === '.pdf') fileCategory = 'pdf';
      else if (['.jpg', '.jpeg', '.png'].includes(ext)) fileCategory = 'image';
      else if (['.doc', '.docx'].includes(ext)) fileCategory = 'word';
      else if (['.ppt', '.pptx'].includes(ext)) fileCategory = 'presentation';
      else fileCategory = 'document';
    }

    const targetAudience = req.user.role === 'superadmin' ? 'admin' : 'student';

    // Creates a brand new document every time
    const announcement = new Announcement({
      admin: req.user._id,
      title,
      content,
      priority,
      attachment: attachmentPath,
      fileType: fileCategory,
      originalFileName: originalName,
      targetAudience
    });

    const createdAnnouncement = await announcement.save();
    
    // Populate admin details before sending back so UI updates immediately
    const populatedAnnouncement = await Announcement.findById(createdAnnouncement._id)
      .populate('admin', 'firstName lastName stream branch role');
      
    res.status(201).json(populatedAnnouncement);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create announcement', error: error.message });
  }
};

// @desc    Get announcements based on user role
export const getAnnouncements = async (req, res) => {
  try {
    let filter = {};
    
    if (req.user.role === 'student') {
      filter.targetAudience = 'student';
    } else if (req.user.role === 'admin') {
      // Admins see Super Admin posts OR their own posts
      filter.$or = [{ targetAudience: 'admin' }, { admin: req.user._id }];
    }

    const announcements = await Announcement.find(filter)
      .populate('admin', 'firstName lastName stream branch role')
      .sort({ createdAt: -1 }); // Newest first
      
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch announcements', error: error.message });
  }
};

// @desc    Delete an announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    // Security check
    if (req.user.role !== 'superadmin' && announcement.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this announcement' });
    }

    // Free up server storage
    if (announcement.attachment) {
      const filePath = path.join(__dirname, '..', '..', announcement.attachment);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await announcement.deleteOne();
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete announcement', error: error.message });
  }
};