import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, identifier, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { identifier }] });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email or identifier already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      identifier,
      password: hashedPassword,
      role: role || 'student', // Default to student if not provided
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        token: generateToken(user._id, user.role),
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { identifier, password, role } = req.body;

    // Search for the user by EITHER Email OR Roll/Reg Number
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { identifier: identifier.trim() }
      ],
      role: role // Ensures a student can't log in via the Admin tab
    });

    // If no user is found with that email/roll OR if they picked the wrong role tab
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials or role mismatch. Ensure you selected the correct Student/Admin tab.' });
    }

    // Check if an admin is approved
    if (user.role === 'admin' && !user.isApproved) {
      return res.status(403).json({ message: 'Admin account pending approval from Super Admin.' });
    }

    // Verify Password
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