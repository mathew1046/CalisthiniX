import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { sql } from './db';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setup() {
    try {
        const sqlPath = path.join(__dirname, 'setup_workout_templates.sql');
        
        console.log('Running setup_workout_templates.sql...');
        console.log('SQL file path:', sqlPath);

        await sql.file(sqlPath);

        console.log('Workout templates setup complete!');
        
        // Verify the tables were created
        const templates = await sql`SELECT COUNT(*) as count FROM workout_templates`;
        console.log(`Templates in database: ${templates[0].count}`);
        
        const templateExercises = await sql`SELECT COUNT(*) as count FROM workout_template_exercises`;
        console.log(`Template exercises in database: ${templateExercises[0].count}`);
        
    } catch (error) {
        console.error('Error setting up workout templates:', error);
    } finally {
        await sql.end();
    }
}

setup();
