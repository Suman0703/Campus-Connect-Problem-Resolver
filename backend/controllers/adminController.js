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
    const { id } = req.params;
    const { status } = req.body;

    // 1. Update the document in the database
    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // 2. TRIGGER WEBSOCKET NOTIFICATION TO THE STUDENT
    const io = req.app.get('io');
    if (io) {
      // Safely grab the student ID whether it was populated or not
      const studentId = complaint.student._id || complaint.student;
      
      // Target the student's isolated socket room
      io.to(`user:${studentId}`).emit('status_change_alert', {
        complaintId: complaint._id,
        title: complaint.title,
        newStatus: complaint.status,
        updatedAt: complaint.updatedAt,
        message: `Your report "${complaint.title}" is now marked as "${complaint.status}".`
      });
    }

    return res.status(200).json(complaint);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update complaint status', error: error.message });
  }
};


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