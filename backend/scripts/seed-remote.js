const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Hardcoded Production URI
const MONGO_URI = 'mongodb+srv://ahmad_omnora:98158302384@cluster0.mnp2buu.mongodb.net/?appName=Cluster0';

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    addresses: [{
        street: String,
        city: String,
        postalCode: String,
        country: String
    }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const seed = async () => {
    try {
        console.log('Connecting to Atlas...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected!');

        const email = 'admin@omnora.com';
        const password = 'admin123';

        // Check availability
        const exists = await User.findOne({ email });
        if (exists) {
            console.log('Admin user already exists. Resetting password...');
            const salt = await bcrypt.genSalt(10);
            exists.password = await bcrypt.hash(password, salt);
            exists.role = 'admin';
            await exists.save();
            console.log('Password reset to: admin123');
        } else {
            console.log('Creating new admin user...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await User.create({
                firstName: 'Admin',
                lastName: 'User',
                email,
                password: hashedPassword,
                role: 'admin'
            });
            console.log('Admin created!');
        }

        console.log('Done.');
        process.exit(0);
    } catch (e) {
        console.error('Seeding failed:', e);
        process.exit(1);
    }
};

seed();
