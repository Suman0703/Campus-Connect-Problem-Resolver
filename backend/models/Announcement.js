import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['Normal', 'High', 'Emergency'],
    default: 'Normal',
  },
  attachment: {
    type: String,
    default: null, // Stores the file path (e.g., /uploads/announcements/file.pdf)
  },
  fileType: {
    type: String, // E.g., 'image', 'pdf', 'document'
    default: null,
  },
  originalFileName: {
    type: String,
    default: null,
  }
}, { timestamps: true });

export default mongoose.model('Announcement', announcementSchema);