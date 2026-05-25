import Complaint from '../models/Complaint.js';

// @desc    Get all complaints for the department
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('student', 'firstName lastName identifier')
      .sort({ createdAt: -1 });
      
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch complaints', error: error.message });
  }
};

// @desc    Get complaints explicitly assigned to THIS admin
// @route   GET /api/admin/complaints/assigned
export const getAssignedComplaints = async (req, res) => {
  try {
    // Look strictly for complaints where assignedAdmin matches the logged-in user's ID
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