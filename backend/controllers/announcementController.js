import Announcement from '../models/Announcement.js';
import path from 'path';

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

    const announcement = new Announcement({
      admin: req.user._id,
      title,
      content,
      priority,
      attachment: attachmentPath,
      fileType: fileCategory,
      originalFileName: originalName
    });

    const createdAnnouncement = await announcement.save();
    res.status(201).json(createdAnnouncement);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create announcement', error: error.message });
  }
};

// @desc    Get all announcements
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('admin', 'firstName lastName stream branch')
      .sort({ createdAt: -1 }); // Newest first
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch announcements', error: error.message });
  }
};