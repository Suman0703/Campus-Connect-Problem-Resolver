import Complaint from '../models/Complaint.js';
import User from '../models/User.js';

// @desc    Get all complaints for the department
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('student', 'firstName lastName identifier')
      .populate('assignedAdmin', 'firstName lastName')
      .sort({ createdAt: -1 });
      
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch complaints', error: error.message });
  }
};

// @desc    Get complaints explicitly assigned to THIS admin
export const getAssignedComplaints = async (req, res) => {
  try {
    const assignedComplaints = await Complaint.find({ assignedAdmin: req.user._id })
      .populate('student', 'firstName lastName identifier')
      .sort({ createdAt: -1 });
      
    res.json(assignedComplaints);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch assigned complaints', error: error.message });
  }
};

// @desc    Update complaint status
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status, resolutionNote } = req.body;
    const complaintId = req.params.id;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.status = status;
    if (resolutionNote) complaint.resolutionNote = resolutionNote;

    const updatedComplaint = await complaint.save();
    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
};

// ==========================================
// NEW: STUDENT MANAGEMENT FUNCTIONALITY
// ==========================================

// @desc    Get all registered students
// @route   GET /api/admin/students
export const getAllStudents = async (req, res) => {
  try {
    // Only fetch users with the 'student' role
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });
      
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students', error: error.message });
  }
};

// @desc    Delete a student account
// @route   DELETE /api/admin/students/:id
export const deleteStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // SECURITY CHECK: Admins should only delete students
    if (student.role !== 'student') {
      return res.status(403).json({ message: 'Access Denied: You can only remove student accounts.' });
    }

    await student.deleteOne();
    res.json({ message: 'Student account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete student', error: error.message });
  }
};