import "dotenv/config";
import { sql } from "./db";

async function runSeed() {
  console.log("Seeding workout templates v2...");
  
  try {
    // Delete existing template data first
    console.log("Clearing existing templates...");
    await sql`DELETE FROM workout_template_exercises`;
    await sql`DELETE FROM workout_templates`;
    
    console.log("Inserting new templates...");
    
    // Insert templates
    await sql`
      INSERT INTO workout_templates (id, user_id, name, description, difficulty, category, is_public)
      VALUES
        (
          'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          'system',
          'Push Day Fundamentals',
          'A solid push workout focusing on chest, shoulders, and triceps using bodyweight exercises. Perfect for beginners starting their calisthenics journey.',
          'beginner',
          'push',
          TRUE
        ),
        (
          'b2c3d4e5-f6a7-8901-bcde-f12345678901',
          'system',
          'Pull Day Foundations',
          'Build a strong back and biceps with this foundational pulling workout. Master the basics before progressing.',
          'beginner',
          'pull',
          TRUE
        ),
        (
          'c3d4e5f6-a7b8-9012-cdef-123456789012',
          'system',
          'Legs Day Basics',
          'Develop lower body strength and mobility with fundamental leg exercises. No equipment needed.',
          'beginner',
          'legs',
          TRUE
        ),
        (
          'd4e5f6a7-b8c9-0123-def0-234567890123',
          'system',
          'Core & Stability',
          'Strengthen your core and improve stability with these essential exercises. A strong core is the foundation of all movement.',
          'beginner',
          'core',
          TRUE
        ),
        (
          'e5f6a7b8-c9d0-1234-ef01-345678901234',
          'system',
          'Full Body Strength',
          'Complete full body workout hitting all major muscle groups. Great for building foundational strength with a balanced approach.',
          'intermediate',
          'full_body',
          TRUE
        ),
        (
          'f6a7b8c9-d0e1-2345-f012-456789012345',
          'system',
          'Advanced Push Power',
          'Challenge yourself with advanced pushing movements. Requires solid foundation in basic push exercises.',
          'advanced',
          'push',
          TRUE
        ),
        (
          'a7b8c9d0-e1f2-3456-0123-567890123456',
          'system',
          'Advanced Pull Mastery',
          'Take your pulling strength to the next level with muscle-ups and lever progressions.',
          'advanced',
          'pull',
          TRUE
        )
    `;
    
    console.log("Templates inserted. Now adding exercises...");
    
    // Template 1: Push Day Fundamentals (beginner push)
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', id, 1, 3, 12, 60, 'Focus on full range of motion, chest to floor'
      FROM exercise_library WHERE slug = 'push-up'
    `;
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', id, 2, 3, 8, 90, 'Keep elbows close to body for tricep focus'
      FROM exercise_library WHERE slug = 'diamond-push-up'
    `;
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', id, 3, 3, 10, 90, 'Great for shoulder development, hips elevated'
      FROM exercise_library WHERE slug = 'pike-push-up'
    `;
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', id, 4, 3, 8, 90, 'Go to 90 degrees for full activation'
      FROM exercise_library WHERE slug = 'dip'
    `;
    
    // Template 2: Pull Day Foundations (beginner pull)
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'b2c3d4e5-f6a7-8901-bcde-f12345678901', id, 1, 3, 8, 90, 'Underhand grip, easier than pull-ups'
      FROM exercise_library WHERE slug = 'chin-up'
    `;
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'b2c3d4e5-f6a7-8901-bcde-f12345678901', id, 2, 3, 10, 60, 'Keep body straight, retract scapula'
      FROM exercise_library WHERE slug = 'ring-row'
    `;
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'b2c3d4e5-f6a7-8901-bcde-f12345678901', id, 3, 3, 10, 60, 'Control the movement, no swinging'
      FROM exercise_library WHERE slug = 'hanging-leg-raise'
    `;
    
    // Template 3: Legs Day Basics (beginner legs)
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'c3d4e5f6-a7b8-9012-cdef-123456789012', id, 1, 4, 15, 60, 'Full depth, knees tracking over toes'
      FROM exercise_library WHERE slug = 'squat'
    `;
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'c3d4e5f6-a7b8-9012-cdef-123456789012', id, 2, 3, 10, 60, 'Alternate legs, front knee over ankle'
      FROM exercise_library WHERE slug = 'lunge'
    `;
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'c3d4e5f6-a7b8-9012-cdef-123456789012', id, 3, 3, 10, 90, 'Explosive jump, land softly'
      FROM exercise_library WHERE slug = 'jump-squat'
    `;
    
    // Template 4: Core & Stability (beginner core)
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'd4e5f6a7-b8c9-0123-def0-234567890123', id, 1, 3, 45, 60, 'Hold for 45 seconds, no hip sag'
      FROM exercise_library WHERE slug = 'plank'
    `;
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'd4e5f6a7-b8c9-0123-def0-234567890123', id, 2, 3, 30, 60, 'Lower back pressed to floor, point toes'
      FROM exercise_library WHERE slug = 'hollow-body-hold'
    `;
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'd4e5f6a7-b8c9-0123-def0-234567890123', id, 3, 3, 10, 60, 'Controlled movement, engage hip flexors'
      FROM exercise_library WHERE slug = 'hanging-leg-raise'
    `;
    
    // Template 5: Full Body Strength (intermediate full_body)
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'e5f6a7b8-c9d0-1234-ef01-345678901234', id, 1, 4, 8, 120, 'Control the negative portion'
      FROM exercise_library WHERE slug = 'pull-up'
    `;
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'e5f6a7b8-c9d0-1234-ef01-345678901234', id, 2, 4, 12, 90, 'Chest to floor each rep'
      FROM exercise_library WHERE slug = 'push-up'
    `;
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'e5f6a7b8-c9d0-1234-ef01-345678901234', id, 3, 4, 10, 90, 'Full depth parallel bar dips'
      FROM exercise_library WHERE slug = 'dip'
    `;
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'e5f6a7b8-c9d0-1234-ef01-345678901234', id, 4, 4, 15, 90, 'Full depth, knees tracking over toes'
      FROM exercise_library WHERE slug = 'squat'
    `;
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'e5f6a7b8-c9d0-1234-ef01-345678901234', id, 5, 3, 10, 60, 'Alternate legs, maintain balance'
      FROM exercise_library WHERE slug = 'lunge'
    `;
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'e5f6a7b8-c9d0-1234-ef01-345678901234', id, 6, 3, 45, 60, 'Hold for 45 seconds, keep core tight'
      FROM exercise_library WHERE slug = 'plank'
    `;
    
    // Template 6: Advanced Push Power (advanced push)
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'f6a7b8c9-d0e1-2345-f012-456789012345', id, 1, 4, 5, 180, 'Wall supported, full range of motion'
      FROM exercise_library WHERE slug = 'handstand-push-up'
    `;
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'f6a7b8c9-d0e1-2345-f012-456789012345', id, 2, 4, 8, 120, 'Deep dips, full extension'
      FROM exercise_library WHERE slug = 'dip'
    `;
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'f6a7b8c9-d0e1-2345-f012-456789012345', id, 3, 3, 10, 90, 'Slow and controlled'
      FROM exercise_library WHERE slug = 'diamond-push-up'
    `;
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'f6a7b8c9-d0e1-2345-f012-456789012345', id, 4, 3, 12, 90, 'Hips high, vertical press'
      FROM exercise_library WHERE slug = 'pike-push-up'
    `;
    
    // Template 7: Advanced Pull Mastery (advanced pull)
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'a7b8c9d0-e1f2-3456-0123-567890123456', id, 1, 4, 3, 180, 'Explosive pull, fast transition'
      FROM exercise_library WHERE slug = 'muscle-up'
    `;
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'a7b8c9d0-e1f2-3456-0123-567890123456', id, 2, 4, 8, 120, 'Strict form, no kipping'
      FROM exercise_library WHERE slug = 'pull-up'
    `;
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'a7b8c9d0-e1f2-3456-0123-567890123456', id, 3, 3, 15, 90, 'Toes to bar if possible'
      FROM exercise_library WHERE slug = 'hanging-leg-raise'
    `;
    await sql`
      INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
      SELECT 'a7b8c9d0-e1f2-3456-0123-567890123456', id, 4, 3, 20, 60, 'Work on time under tension'
      FROM exercise_library WHERE slug = 'l-sit'
    `;
    
    console.log("✅ Workout templates v2 seeded successfully!");
    
    // Verify the seed
    const templates = await sql`SELECT id, name, category, difficulty, is_public FROM workout_templates`;
    console.log(`\n📋 Templates in database: ${templates.length}`);
    templates.forEach((t: any) => {
      console.log(`  - ${t.name} (${t.category}, ${t.difficulty}, public: ${t.is_public})`);
    });
    
    const exercises = await sql`SELECT COUNT(*) as count FROM workout_template_exercises`;
    console.log(`\n🏋️ Total template exercises: ${exercises[0].count}`);
    
  } catch (error) {
    console.error("❌ Error seeding templates:", error);
    throw error;
  }
  
  process.exit(0);
}

runSeed();
