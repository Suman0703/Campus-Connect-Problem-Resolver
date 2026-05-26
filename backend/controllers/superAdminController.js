import User from '../models/User.js';
import Complaint from '../models/Complaint.js';

// @desc    Get global system statistics
export const getSystemStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAdmins = await User.countDocuments({ role: 'admin', isApproved: true });
    const totalComplaints = await Complaint.countDocuments();
    const resolvedComplaints = await Complaint.countDocuments({ status: 'Resolved' });
    const pendingComplaints = await Complaint.countDocuments({ status: 'Pending' });

    res.json({
      users: { students: totalStudents, admins: totalAdmins },
      complaints: { total: totalComplaints, resolved: resolvedComplaints, pending: pendingComplaints }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch global stats' });
  }
};

// @desc    Get all pending admin approvals
export const getPendingAdmins = async (req, res) => {
  try {
    const pendingAdmins = await User.find({ role: 'admin', isApproved: { $ne: true } }).select('-password');
    res.json(pendingAdmins);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending admins' });
  }
};

// @desc    Approve an admin account
export const approveAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    if (!admin || admin.role !== 'admin') return res.status(404).json({ message: 'Admin not found' });

    admin.isApproved = true;
    await admin.save();
    res.json({ message: 'Admin approved', admin });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve admin' });
  }
};

// @desc    Reject a pending admin request
export const rejectAdmin = async (req, res) => {
  try {
    const admin = await User.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json({ message: 'Admin request rejected.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject admin' });
  }
};

// ==========================================
// PERSONNEL MANAGEMENT FEATURES
// ==========================================

// @desc    Get all APPROVED admins
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin', isApproved: true }).select('-password').sort({ createdAt: -1 });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch active administrators' });
  }
};

// @desc    Delete/Revoke an approved admin
export const deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    
    // Note: Complaints assigned to this admin will remain, but the assignedAdmin field will now reference a deleted user.
    res.json({ message: 'Administrator access securely revoked.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to revoke admin access' });
  }
};