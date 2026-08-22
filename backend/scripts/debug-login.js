const User = require('../models/User');
const { validateEnv } = require('../config/env');

const fs = require('fs');

const log = (msg) => {
    fs.appendFileSync('debug_result.txt', msg + '\n');
    console.log(msg);
};

const runDebug = async () => {
    fs.writeFileSync('debug_result.txt', ''); // Clear file
    log("--- Debugging Login Logic ---");

    // 1. Check DB Mode
    const useMongo = !!process.env.MONGODB_URI;
    log(`Mode: ${useMongo ? 'MongoDB' : 'LocalDB'}`);

    try {
        // 2. Simulate Login
        const email = "pakahmad9815@gmail.com"; // UPDATED to match users.json
        log(`Attempting to find user: ${email}`);

        // 3. Test the Chain
        log("Testing User.findOne().select('+password')...");
        const query = User.findOne({ email });

        if (typeof query.select !== 'function') {
            log("ERROR: .select() function missing on query object!");
        } else {
            log(".select() function exists.");
        }

        const user = await query.select('+password');

        if (!user) {
            log("User not found.");
            return;
        }

        log(`User found: ${user._id}`);

        // 4. Test Password Match
        log("Testing matchPassword...");
        if (typeof user.matchPassword !== 'function') {
            log("ERROR: matchPassword function missing on user object!");
        } else {
            log("matchPassword exists.");
        }

        // 5. Test Password Hash (Redacted)
        log(`Password hash length: ${user.password ? user.password.length : 'MISSING'}`);

        log("SUCCESS: Logic seems valid.");

    } catch (error) {
        log(`CRITICAL ERROR CAUGHT: ${error.message}`);
        log(error.stack);
    }
};

runDebug();
