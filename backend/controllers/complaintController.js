import Complaint from '../models/Complaint.js';

export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, location, assignedAdmin } = req.body;
    
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const complaint = new Complaint({
      student: req.user._id,
      title,
      description,
      category,
      location,
      image: imagePath,
      // Save the assigned admin ONLY if a valid ID was sent
      assignedAdmin: assignedAdmin && assignedAdmin !== '' ? assignedAdmin : null,
    });

    const createdComplaint = await complaint.save();
    res.status(201).json(createdComplaint);
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit complaint', error: error.message });
  }
};

export const getMyComplaints = async (req, res) => {
  try {
    // Populate the assignedAdmin details so students can see who they assigned it to
    const complaints = await Complaint.find({ student: req.user._id })
      .populate('assignedAdmin', 'firstName lastName department')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your complaints', error: error.message });
  }
};