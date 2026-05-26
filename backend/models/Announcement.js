import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    // CRITICAL: Ensure 'unique: true' is NOT here.
  },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  priority: {
    type: String,
    enum: ['Normal', 'High', 'Emergency'],
    default: 'Normal',
  },
  attachment: { type: String, default: null },
  fileType: { type: String, default: null },
  originalFileName: { type: String, default: null },
  targetAudience: {
    type: String,
    enum: ['student', 'admin', 'all'],
    default: 'student'
  },
  createdAt: { type: Date, default: Date.now }
});

// TTL INDEX: Automatically delete documents 30 days (2,592,000 seconds) after creation
announcementSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export default mongoose.model('Announcement', announcementSchema);