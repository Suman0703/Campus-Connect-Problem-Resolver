import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Load environment variables so we can connect to the database
dotenv.config();

const seedSuperAdmin = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 Connected to MongoDB...');

    // 2. Check if a Super Admin already exists to prevent duplicates
    const adminExists = await User.findOne({ role: 'superadmin' });
    
    if (adminExists) {
      console.log('⚠️ A Super Admin account already exists in the database.');
      process.exit(0);
    }

    // 3. Create the secure password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt); // Change this password if you want!

    // 4. Create the Super Admin user
    const superAdmin = new User({
      firstName: 'System',
      lastName: 'Overseer',
      email: 'admin@campusconnect.com',
      identifier: 'SUPER001',
      password: hashedPassword,
      role: 'superadmin',
      isApproved: true // Super Admins are pre-approved by default
    });

    await superAdmin.save();
    console.log('✅ Success! Super Admin account created.');
    console.log('📧 Email: admin@campusconnect.com');
    console.log('🔑 Password: Admin@123');

    // 5. Exit the script safely
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding Super Admin:', error.message);
    process.exit(1);
  }
};

// Run the function
seedSuperAdmin();