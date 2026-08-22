import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');

const REQUIRED_TABLES = [
    'products',
    'orders',
    'site_theme_settings',
    'site_social_settings',
    'customer_profiles',
    'font_pairs'
];

console.log('🔍 [SCHEMA VERIFICATION] Checking Supabase baseline migrations...');

if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error('❌ Migration directory missing:', MIGRATIONS_DIR);
    process.exit(1);
}

const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql'));
console.log(`Found ${files.length} migration file(s).`);

let combinedSql = '';
files.forEach(file => {
    combinedSql += fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8') + '\n';
});

let missing = [];
REQUIRED_TABLES.forEach(table => {
    const pattern = new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${table}|CREATE TABLE public\\.${table}`, 'i');
    if (!pattern.test(combinedSql)) {
        missing.push(table);
    }
});

if (missing.length > 0) {
    console.error(`❌ [SCHEMA VERIFICATION FAILED] Missing table definitions in migrations: ${missing.join(', ')}`);
    process.exit(1);
}

console.log('✅ [SCHEMA VERIFICATION PASSED] All required baseline tables present in repository migrations.');
