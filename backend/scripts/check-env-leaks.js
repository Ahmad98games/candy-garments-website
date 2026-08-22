const fs = require('fs');
const path = require('path');

const BACKEND_DIR = path.resolve(__dirname, '..');
const ALLOWED_FILES = [
    path.join('config', 'env.js'),
    path.join('bootstrap.js'),
];

const IGNORED_DIRS = ['node_modules', 'tests', 'dist', '.git'];

function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(path.resolve(__dirname, '..'), fullPath);

        if (entry.isDirectory()) {
            if (IGNORED_DIRS.includes(entry.name)) continue;
            scanDir(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.ts'))) {
            if (ALLOWED_FILES.some(allowed => relativePath === allowed)) continue;

            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('process.env')) {
                console.error(`ERROR: Unauthorized access to process.env found in: ${relativePath}`);
                console.error(`Please use the centralized config/env.js instead.`);
                process.exit(1);
            }
        }
    }
}

console.log('--- Checking for process.env leaks ---');
try {
    scanDir(BACKEND_DIR);
    console.log('SUCCESS: No process.env leaks detected.');
} catch (error) {
    console.error('CRITICAL: Leak check failed:', error.message);
    process.exit(1);
}
