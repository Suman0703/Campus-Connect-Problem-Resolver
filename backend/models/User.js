// backend/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  identifier: { type: String, required: true, unique: true, trim: true }, // Roll No or Reg No
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'admin', 'superadmin'], 
    default: 'student' 
  },
  isApproved: { 
    type: Boolean, 
    default: function() {
      // Students are auto-approved. Admins need superadmin approval.
      return this.role === 'student'; 
    }
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;