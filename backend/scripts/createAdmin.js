/**
 * Create Admin User Script
 * 
 * This script creates an admin user for accessing the admin dashboard.
 * Run with: node scripts/createAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const ADMIN_CREDENTIALS = {
    name: 'Admin',
    email: 'admin@omnora.com',  // Change this if you want
    password: 'admin123',         // CHANGE THIS IMMEDIATELY after first login!
    role: 'admin'
};

async function createAdmin() {
    try {
        if (User.prototype instanceof mongoose.Model) {
            console.log('🔌 Connecting to MongoDB...');
            if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing for Mongoose mode');
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('✅ Connected to MongoDB\n');
        } else {
            console.log('📂 Using LocalDB (File-based persistence)\n');
        }

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: ADMIN_CREDENTIALS.email });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Role: ${existingAdmin.role}`);

            // Update to admin role if not already admin
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('✅ Updated user to admin role');
            }

            console.log('\n✨ Admin account is ready!');
            console.log('📧 Email:', ADMIN_CREDENTIALS.email);
            console.log('🔑 Password:', ADMIN_CREDENTIALS.password);
            console.log('\n⚠️  IMPORTANT: Change the password after first login!');
        } else {
            // Create new admin user
            console.log('📝 Creating new admin user...');
            const admin = await User.create(ADMIN_CREDENTIALS);

            console.log('\n✅ Admin user created successfully!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📧 Email:', ADMIN_CREDENTIALS.email);
            console.log('🔑 Password:', ADMIN_CREDENTIALS.password);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('\n⚠️  IMPORTANT: Change this password after first login!');
            console.log('\n📖 How to login:');
            console.log('   1. Go to: http://localhost:5173/login');
            console.log('   2. Enter the email and password above');
            console.log('   3. After login, go to: http://localhost:5173/admin');
        }

        console.log('\n🎉 Setup complete!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the script
createAdmin();
