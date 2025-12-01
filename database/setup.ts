/**
 * Calyxpert - Unified Database Setup Script
 * 
 * This script handles all database initialization:
 * 1. Creates all tables (schema.sql)
 * 2. Seeds initial data (seed.sql) - optional
 * 
 * Usage:
 *   npx tsx database/setup.ts          # Schema only
 *   npx tsx database/setup.ts --seed   # Schema + Seed data
 *   npx tsx database/setup.ts --reset  # Drop all + Schema + Seed
 */

import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const shouldSeed = args.includes('--seed');
const shouldReset = args.includes('--reset');

async function setup() {
  console.log('\n🚀 Calyxpert Database Setup\n');
  console.log('━'.repeat(50));

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('   Please check your .env file\n');
    process.exit(1);
  }

  const sql = postgres(process.env.DATABASE_URL);

  try {
    // Step 1: Reset if requested
    if (shouldReset) {
      console.log('\n⚠️  Resetting database (dropping all tables)...');
      
      // Drop tables in correct order (respecting foreign keys)
      await sql`DROP TABLE IF EXISTS workout_template_exercises CASCADE`;
      await sql`DROP TABLE IF EXISTS workout_templates CASCADE`;
      await sql`DROP TABLE IF EXISTS exercises CASCADE`;
      await sql`DROP TABLE IF EXISTS workouts CASCADE`;
      await sql`DROP TABLE IF EXISTS journal_entries CASCADE`;
      await sql`DROP TABLE IF EXISTS personal_records CASCADE`;
      await sql`DROP TABLE IF EXISTS exercise_library CASCADE`;
      await sql`DROP TABLE IF EXISTS sessions CASCADE`;
      await sql`DROP TABLE IF EXISTS users CASCADE`;
      
      console.log('   ✓ All tables dropped\n');
    }

    // Step 2: Run schema.sql
    console.log('📋 Creating database schema...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    await sql.file(schemaPath);
    console.log('   ✓ Schema created successfully\n');

    // Step 3: Run seed.sql if requested
    if (shouldSeed || shouldReset) {
      console.log('🌱 Seeding database with initial data...');
      const seedPath = path.join(__dirname, 'seed.sql');
      await sql.file(seedPath);

      // Create a default user for development
      console.log('   Creating default user and mock history...');
      const [user] = await sql`
        INSERT INTO users (id, email, display_name, first_name, last_name, current_level, level_progress, streak, weight)
        VALUES ('user-123', 'demo@example.com', 'Demo Athlete', 'Demo', 'User', 2, 35, 5, 75)
        ON CONFLICT (id) DO UPDATE SET 
          display_name = EXCLUDED.display_name,
          current_level = EXCLUDED.current_level
        RETURNING id
      `;

      // Create a past workout
      const [workout] = await sql`
        INSERT INTO workouts (user_id, name, date, duration, total_volume, notes)
        VALUES (${user.id}, 'Full Body Blast', NOW() - INTERVAL '2 days', 2700, 4500, 'Felt great, increased reps on pull-ups.')
        RETURNING id
      `;

      // Add exercises to that workout
      await sql`
        INSERT INTO exercises (workout_id, name, sets, "order")
        VALUES 
        (${workout.id}, 'Push-up', '[{"reps": 20, "rpe": 7, "completed": true}, {"reps": 15, "rpe": 8, "completed": true}, {"reps": 12, "rpe": 9, "completed": true}]'::jsonb, 0),
        (${workout.id}, 'Pull-up', '[{"reps": 10, "rpe": 8, "completed": true}, {"reps": 8, "rpe": 9, "completed": true}, {"reps": 6, "rpe": 9, "completed": true}]'::jsonb, 1),
        (${workout.id}, 'Squat', '[{"reps": 25, "rpe": 6, "completed": true}, {"reps": 25, "rpe": 7, "completed": true}]'::jsonb, 2)
      `;

      console.log('   ✓ Seed data inserted successfully\n');
    }

    // Step 4: Verify setup
    console.log('🔍 Verifying setup...');
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log(`   ✓ Found ${tables.length} tables:`);
    tables.forEach((t: any) => console.log(`     - ${t.table_name}`));

    // Count records in key tables
    const exerciseCount = await sql`SELECT COUNT(*) as count FROM exercise_library`;
    const templateCount = await sql`SELECT COUNT(*) as count FROM workout_templates`;
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    
    console.log('\n📊 Data Summary:');
    console.log(`   - Exercises in library: ${exerciseCount[0].count}`);
    console.log(`   - Workout templates: ${templateCount[0].count}`);
    console.log(`   - Users: ${userCount[0].count}`);

    console.log('\n' + '━'.repeat(50));
    console.log('✅ Database setup completed successfully!\n');

  } catch (error: any) {
    console.error('\n❌ Database setup failed:');
    console.error(`   ${error?.message || error}\n`);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

setup();
