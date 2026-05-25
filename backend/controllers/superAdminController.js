import User from '../models/User.js';
import Complaint from '../models/Complaint.js';

// @desc    Get global system statistics
// @route   GET /api/superadmin/stats
export const getSystemStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
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
// @route   GET /api/superadmin/pending-admins
export const getPendingAdmins = async (req, res) => {
  try {
    // Find users who are admins and explicitly false/not approved yet
    const pendingAdmins = await User.find({ 
      role: 'admin', 
      isApproved: false 
    }).select('-password');
    
    console.log(`[API SEND] Sending ${pendingAdmins.length} pending admins to the frontend.`);
    res.json(pendingAdmins);
  } catch (error) {
    console.error("[API ERROR] Failed to fetch pending admins:", error);
    res.status(500).json({ message: 'Failed to fetch pending admins' });
  }
};

// @desc    Approve an admin account
// @route   PUT /api/superadmin/approve-admin/:id
export const approveAdmin = async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);
    
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin account not found' });
    }

    admin.isApproved = true;
    await admin.save();

    res.json({ message: 'Admin account approved successfully', admin });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve admin' });
  }
};

// @desc    Reject/Delete an admin account
// @route   DELETE /api/superadmin/reject-admin/:id
export const rejectAdmin = async (req, res) => {
  try {
    const admin = await User.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin account not found' });
    }
    res.json({ message: 'Admin request rejected and account deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject admin' });
  }
};