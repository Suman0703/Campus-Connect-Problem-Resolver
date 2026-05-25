import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, identifier, password, role, stream, branch, semester, contactNumber } = req.body;

    if (role === 'superadmin') {
      return res.status(403).json({ message: 'Unauthorized: Cannot register as a Super Admin.' });
    }

    const finalRole = (role === 'admin') ? 'admin' : 'student';
    const userExists = await User.findOne({ $or: [{ email }, { identifier }] });
    
    if (userExists) {
      return res.status(400).json({ message: 'User with this email or identifier already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user and save fields ONLY if the user is an admin
    const user = await User.create({
      firstName,
      lastName,
      email,
      identifier,
      password: hashedPassword,
      role: finalRole, 
      stream: finalRole === 'admin' ? stream : '',
      branch: finalRole === 'admin' ? branch : '',
      semester: finalRole === 'admin' ? semester : '',
      contactNumber: finalRole === 'admin' ? contactNumber : '',
      isApproved: finalRole === 'student'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        token: user.isApproved ? generateToken(user._id, user.role) : null,
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Authenticate user & get token
export const loginUser = async (req, res) => {
  try {
    const { identifier, password, role } = req.body;

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { identifier: identifier.trim() }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    if (role === 'student' && user.role !== 'student') {
      return res.status(401).json({ message: 'Role mismatch: Please use the Administrator tab to log in.' });
    }
    if (role === 'admin' && (user.role !== 'admin' && user.role !== 'superadmin')) {
      return res.status(401).json({ message: 'Role mismatch: Please use the Student tab to log in.' });
    }

    if (user.role === 'admin' && !user.isApproved) {
      return res.status(403).json({ message: 'Admin account pending approval from Super Admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (user && isMatch) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        identifier: user.identifier,
        role: user.role, 
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid password.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Fetch Approved Admins for Students
export const getApprovedAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin', isApproved: true })
      .select('firstName lastName email stream branch semester contactNumber');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch management directory' });
  }
};