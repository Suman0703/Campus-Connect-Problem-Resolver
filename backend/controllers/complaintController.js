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

    // Trigger Real-Time WebSocket Notification to Admins
    const io = req.app.get('io');
    if (io) {
      const studentName = req.user.name || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'A Student';
      
      const payload = {
        complaintId: createdComplaint._id,
        title: createdComplaint.title,
        category: createdComplaint.category,
        location: createdComplaint.location,
        studentName,
        assignedAdmin: createdComplaint.assignedAdmin,
        createdAt: createdComplaint.createdAt,
        message: `New Issue Reported: "${createdComplaint.title}" by ${studentName}`
      };

      // Broadcast to general admins room
      io.to('admins').emit('new_complaint_alert', payload);

      // If assigned directly to a specific admin, send to their personal room as well
      if (createdComplaint.assignedAdmin) {
        io.to(`user:${createdComplaint.assignedAdmin}`).emit('new_complaint_alert', {
          ...payload,
          message: `Direct Issue Assigned to You: "${createdComplaint.title}"`
        });
      }
    }

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