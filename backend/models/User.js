import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  identifier: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin', 'superadmin'], default: 'student' },
  
  // SPECIFIC ADMIN FIELDS
  stream: { type: String, default: '' },       // e.g., B.Tech, MCA
  branch: { type: String, default: '' },       // e.g., CSE, Mechanical
  semester: { type: String, default: '' },     // e.g., 6
  contactNumber: { type: String, default: '' }, // e.g., +91 9876543210
  
  isApproved: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.index({ role: 1 }, { unique: true, partialFilterExpression: { role: 'superadmin' } });

const User = mongoose.model('User', userSchema);
export default User;