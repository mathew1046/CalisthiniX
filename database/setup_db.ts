import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { sql } from '../server/db';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setup() {
    try {
        const sqlPath = path.join(__dirname, 'setup_exercises.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running setup_exercises.sql...');

        // postgres.js doesn't support multiple statements in one query by default unless simple protocol is used or we split them.
        // However, sql.unsafe might work if the driver supports it.
        // Better to split by semicolon if it fails, but let's try unsafe first.
        // Actually, postgres.js `unsafe` executes a query. Multiple statements might be rejected.
        // Let's try `sql.file` which is designed for this.

        await sql.file(sqlPath);

        console.log('Database setup complete.');
    } catch (error) {
        console.error('Error setting up database:', error);
    } finally {
        await sql.end();
    }
}

setup();
