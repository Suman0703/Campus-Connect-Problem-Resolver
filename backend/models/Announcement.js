import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Notice', 'Event', 'Deadline', 'General'],
    default: 'General',
  },
  attachmentUrl: {
    type: String, // For PDFs or images
    default: null,
  }
}, { timestamps: true });

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;