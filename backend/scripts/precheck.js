const fs = require('fs');
const path = require('path');

/**
 * PRECHECK: Airtight Static Analysis Guard
 * 
 * Scans for unauthorized initialization of sensitive infrastructure.
 * This ensures developers use the sealed service layer.
 */
const FORBIDDEN_PATTERNS = [
    { regex: /new\s+Queue\s*\(/g, message: 'CRITICAL: Direct BullMQ instantiation forbidden. Use services/queueService.js' },
    { regex: /new\s+IORedis\s*\(/g, message: 'CRITICAL: Direct Redis instantiation forbidden. Use ioredis from services.' },
    { regex: /mongoose\.connect\s*\(/g, message: 'CRITICAL: Manual Mongoose connection forbidden. Use lib/dbConnect.js' }
];

const WHITELIST_FILES = [
    'services\\queueService.js',
    'services\\dbService.js',
    'lib\\dbConnect.js',
    'config\\db.js'
];

const IGNORED_DIRECTORIES = [
    'node_modules',
    '.git',
    'tests',
    'scripts'
];

function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    let violations = 0;

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!IGNORED_DIRECTORIES.includes(file)) {
                violations += scanDirectory(fullPath);
            }
        } else if (file.endsWith('.js')) {
            const isWhitelisted = WHITELIST_FILES.some(w => fullPath.endsWith(w));
            if (isWhitelisted) continue;

            const content = fs.readFileSync(fullPath, 'utf8');
            for (const pattern of FORBIDDEN_PATTERNS) {
                if (pattern.regex.test(content)) {
                    console.error(`\n❌ [VIOLATION] ${fullPath}`);
                    console.error(`   ${pattern.message}`);
                    violations++;
                }
            }
        }
    }
    return violations;
}

console.log('🚀 Running Architectural Invariant Pre-check...');
const totalViolations = scanDirectory(process.cwd());

if (totalViolations > 0) {
    console.error(`\n🎯 FAILED: Found ${totalViolations} architectural violations. Build blocked.\n`);
    process.exit(1);
} else {
    console.log('\n✅ Architectural invariants verified. No leaks detected.\n');
    process.exit(0);
}
