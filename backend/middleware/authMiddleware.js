import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ==========================================
// 1. Protect Route Middleware (For All Users)
// ==========================================
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password').lean();

      if (!req.user) {
        return res.status(401).json({ message: 'User not found. Token is invalid.' });
      }

      return next();
    } catch (error) {
      console.error('Auth Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed or expired.' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }
};

// ==========================================
// 2. Admin Route Middleware (Strict Access)
// ==========================================
export const isAdmin = (req, res, next) => {
  // Must be an Admin AND approved, OR Super Admin
  if (req.user && ((req.user.role === 'admin' && req.user.isApproved === true) || req.user.role === 'superadmin')) {
    return next(); 
  }
  return res.status(403).json({ message: 'Access Denied. Approved Admin privileges required.' });
};

// Alias export for backward compatibility with routes using `adminOnly`
export const adminOnly = isAdmin;

// ==========================================
// 3. Super Admin Route Middleware (Absolute Strict)
// ==========================================
export const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    return next();
  }
  return res.status(403).json({ message: 'Access Denied. Only the Super Admin can perform this action.' });
};