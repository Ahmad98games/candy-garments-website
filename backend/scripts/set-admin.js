require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const email = process.argv[2];
const password = process.argv[3]; // Optional password argument

if (!email) {
    console.log('\nUsage: node scripts/set-admin.js <email> [password]');
    process.exit(1);
}

const setAdmin = async () => {
    try {
        console.log(`Checking user: ${email}...`);

        let user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log('User not found. Creating new admin user...');
            if (!password) {
                console.log('❌ Password is required to create a new user.');
                process.exit(1);
            }

            user = await User.create({
                name: 'Admin User',
                email: email.toLowerCase(),
                password: password,
                role: 'admin'
            });
            console.log(`\n✅ User created and promoted to admin!`);
        } else {
            console.log('User found.');
            let updates = 0;

            if (user.role !== 'admin') {
                user.role = 'admin';
                console.log('Role updated to admin.');
                updates++;
            }

            if (password) {
                const isMatch = await user.matchPassword(password);
                if (!isMatch) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(password, salt);
                    console.log('Password updated.');
                    updates++;
                }
            }

            if (updates > 0) {
                await user.save();
                console.log(`\n✅ User updated successfully.`);
            } else {
                console.log(`\nℹ️  User is already an admin and password matches.`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
};

setAdmin();
