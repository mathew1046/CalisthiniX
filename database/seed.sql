-- CalistheniX Seed Data
-- This file populates the database with initial data
-- Run this AFTER schema.sql

-- ============================================
-- EXERCISE LIBRARY DATA
-- ============================================

-- Delete in correct order (respect foreign keys)
DELETE FROM workout_template_exercises;
DELETE FROM workout_templates;
DELETE FROM exercise_library;

INSERT INTO exercise_library (name, slug, category, difficulty, short_description, long_description, progressions, regressions, muscles_primary, muscles_secondary, equipment, demo_image_url, tips)
VALUES
  ('Push-up', 'push-up', 'push', 'beginner', 'The foundation of upper body pushing strength.', 'Start in a plank position with hands shoulder-width apart. Lower your body until your chest nearly touches the floor. Push back up.', '["Diamond Push-up", "Archer Push-up"]', '["Knee Push-up", "Incline Push-up"]', ARRAY['Chest', 'Triceps'], ARRAY['Core'], ARRAY[]::text[], 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format', ARRAY['Keep core tight', 'Full range']),
  ('Pull-up', 'pull-up', 'pull', 'intermediate', 'The king of upper body pulling exercises.', 'Hang from a bar with overhand grip. Pull yourself up until chin is over bar.', '["Weighted Pull-up", "Muscle-up"]', '["Negative Pull-up", "Band-assisted"]', ARRAY['Lats', 'Biceps'], ARRAY['Forearms'], ARRAY['Pull-up Bar'], 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format', ARRAY['Full extension', 'No swing']),
  ('Dip', 'dip', 'push', 'intermediate', 'A powerful compound pushing movement.', 'Support yourself on parallel bars. Lower until shoulders below elbows. Push back up.', '["Weighted Dip", "Ring Dip"]', '["Bench Dip", "Band-assisted Dip"]', ARRAY['Triceps', 'Chest'], ARRAY['Shoulders'], ARRAY['Parallel Bars'], 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format', ARRAY['Shoulders down', 'Go to 90 degrees']),
  ('Pistol Squat', 'pistol-squat', 'legs', 'advanced', 'A single-leg squat.', 'Stand on one leg. Squat down while keeping other leg straight forward.', '["Weighted Pistol"]', '["Box Pistol", "Assisted Pistol"]', ARRAY['Quadriceps', 'Glutes'], ARRAY['Core'], ARRAY[]::text[], 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format', ARRAY['Keep heel down', 'Balance']),
  ('Plank', 'plank', 'core', 'beginner', 'A foundational isometric core exercise.', 'Hold push-up position on forearms. Keep body straight from head to heels.', '["Weighted Plank", "Long Lever"]', '["Knee Plank"]', ARRAY['Abs', 'Core'], ARRAY['Shoulders'], ARRAY[]::text[], 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format', ARRAY['No hip sag', 'Breathe']),
  ('L-sit', 'l-sit', 'core', 'intermediate', 'Static hold building core strength.', 'Support body on hands. Lift legs parallel to floor forming L shape.', '["V-sit", "Manna"]', '["Tuck L-sit", "One-leg L-sit"]', ARRAY['Abs', 'Hip Flexors'], ARRAY['Triceps'], ARRAY['Parallettes'], 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format', ARRAY['Push floor away', 'Lock knees']),
  ('Handstand', 'handstand', 'skill', 'advanced', 'Balancing on your hands.', 'Kick up against wall or freestanding. Support bodyweight on hands vertically.', '["Handstand Push-up", "Press to Handstand"]', '["Wall Handstand", "Pike Hold"]', ARRAY['Shoulders', 'Traps'], ARRAY['Core', 'Forearms'], ARRAY['Wall'], 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format', ARRAY['Spread fingers', 'Push tall']),
  ('Ring Row', 'ring-row', 'pull', 'beginner', 'Horizontal pulling exercise.', 'Hold rings and lean back. Pull chest to rings keeping body straight.', '["Archer Row"]', '["Incline Ring Row"]', ARRAY['Lats', 'Rhomboids'], ARRAY['Biceps'], ARRAY['Rings'], 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format', ARRAY['Retract scapula', 'Body straight']),
  ('Muscle-up', 'muscle-up', 'pull', 'advanced', 'Pull-up and dip combined.', 'Pull yourself explosively over bar then push into support.', '["Weighted Muscle-up"]', '["Band-assisted", "Jumping"]', ARRAY['Lats', 'Chest', 'Triceps'], ARRAY['Shoulders'], ARRAY['Pull-up Bar'], 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format', ARRAY['Explosive pull', 'Fast transition']),
  ('Squat', 'squat', 'legs', 'beginner', 'Fundamental lower body movement.', 'Stand feet shoulder-width. Lower hips back and down. Stand back up.', '["Pistol Squat", "Jump Squat"]', '["Wall Squat"]', ARRAY['Quadriceps', 'Glutes'], ARRAY['Hamstrings'], ARRAY[]::text[], 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format', ARRAY['Knees over toes', 'Chest up']),
  ('Hollow Body Hold', 'hollow-body-hold', 'core', 'intermediate', 'Gymnastics core staple.', 'Lie on back. Lift shoulders and legs off ground with arms overhead.', '["Hollow Rocks"]', '["Tuck Hollow"]', ARRAY['Abs', 'Hip Flexors'], ARRAY['Quads'], ARRAY[]::text[], 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format', ARRAY['Lower back down', 'Point toes']),
  ('Chin-up', 'chin-up', 'pull', 'beginner', 'Underhand pull-up variation.', 'Hang with underhand grip. Pull up until chin clears bar.', '["Pull-up", "Weighted Chin-up"]', '["Negative Chin-up"]', ARRAY['Biceps', 'Lats'], ARRAY['Forearms'], ARRAY['Pull-up Bar'], 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format', ARRAY['Full hang', 'Control negative']),
  ('Diamond Push-up', 'diamond-push-up', 'push', 'intermediate', 'Triceps-focused push-up.', 'Place hands close forming diamond. Perform push-up with elbows in.', '["One-arm Push-up"]', '["Regular Push-up"]', ARRAY['Triceps', 'Chest'], ARRAY['Shoulders'], ARRAY[]::text[], 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format', ARRAY['Hands under sternum', 'Elbows in']),
  ('Lunge', 'lunge', 'legs', 'beginner', 'Unilateral leg exercise.', 'Step forward. Lower hips until both knees bent at 90 degrees.', '["Walking Lunge", "Jumping Lunge"]', '["Static Lunge"]', ARRAY['Quadriceps', 'Glutes'], ARRAY['Hamstrings'], ARRAY[]::text[], 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format', ARRAY['Front knee over ankle']),
  ('Hanging Leg Raise', 'hanging-leg-raise', 'core', 'intermediate', 'Hanging core exercise.', 'Hang from bar. Raise straight legs until parallel to ground.', '["Toes to Bar"]', '["Knee Raises"]', ARRAY['Abs', 'Hip Flexors'], ARRAY['Forearms'], ARRAY['Pull-up Bar'], 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format', ARRAY['No swing', 'Control movement']),
  ('Pike Push-up', 'pike-push-up', 'push', 'intermediate', 'Shoulder-focused push-up.', 'Start in downward dog position. Lower head toward ground.', '["Handstand Push-up"]', '["Incline Pike"]', ARRAY['Shoulders', 'Triceps'], ARRAY['Core'], ARRAY[]::text[], 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format', ARRAY['Hips elevated', 'Vertical pressing']),
  ('Jump Squat', 'jump-squat', 'legs', 'intermediate', 'Explosive squat variation.', 'Perform squat then jump explosively. Land softly.', '["Box Jump"]', '["Regular Squat"]', ARRAY['Quadriceps', 'Glutes'], ARRAY['Calves'], ARRAY[]::text[], 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format', ARRAY['Land softly', 'Full extension']),
  ('Dragon Flag', 'dragon-flag', 'core', 'advanced', 'Advanced core exercise.', 'Lie on bench. Lift entire body up keeping it straight.', '["One-leg Dragon Flag"]', '["Negative Dragon Flag"]', ARRAY['Abs', 'Hip Flexors'], ARRAY['Lats'], ARRAY['Bench'], 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format', ARRAY['Control negative', 'Body straight']),
  ('Handstand Push-up', 'handstand-push-up', 'push', 'advanced', 'Inverted pressing movement.', 'In handstand against wall. Lower until head touches ground then press up.', '["Freestanding HSPU"]', '["Pike Push-up", "Wall Walks"]', ARRAY['Shoulders', 'Triceps'], ARRAY['Core'], ARRAY['Wall'], 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format', ARRAY['Full range', 'Control descent']),
  ('Front Lever', 'front-lever', 'pull', 'advanced', 'Horizontal static hold.', 'Hang from bar. Raise body parallel to ground forming straight line.', '["Front Lever Pulls"]', '["Tuck Front Lever"]', ARRAY['Lats', 'Core'], ARRAY['Biceps', 'Forearms'], ARRAY['Pull-up Bar'], 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format', ARRAY['Depress scapula', 'Push bar down']);

-- ============================================
-- WORKOUT TEMPLATES DATA
-- ============================================

-- (Already deleted above with exercise_library)

-- Insert comprehensive public templates
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
  );

-- Template 1: Push Day Fundamentals (beginner push)
INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', id, 1, 3, 12, 60, 'Focus on full range of motion, chest to floor'
FROM exercise_library WHERE slug = 'push-up';

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', id, 2, 3, 8, 90, 'Keep elbows close to body for tricep focus'
FROM exercise_library WHERE slug = 'diamond-push-up';

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', id, 3, 3, 10, 90, 'Great for shoulder development, hips elevated'
FROM exercise_library WHERE slug = 'pike-push-up';

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', id, 4, 3, 8, 90, 'Go to 90 degrees for full activation'
FROM exercise_library WHERE slug = 'dip';

-- Template 2: Pull Day Foundations (beginner pull)
INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'b2c3d4e5-f6a7-8901-bcde-f12345678901', id, 1, 3, 8, 90, 'Underhand grip, easier than pull-ups'
FROM exercise_library WHERE slug = 'chin-up';

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'b2c3d4e5-f6a7-8901-bcde-f12345678901', id, 2, 3, 10, 60, 'Keep body straight, retract scapula'
FROM exercise_library WHERE slug = 'ring-row';

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'b2c3d4e5-f6a7-8901-bcde-f12345678901', id, 3, 3, 10, 60, 'Control the movement, no swinging'
FROM exercise_library WHERE slug = 'hanging-leg-raise';

-- Template 3: Legs Day Basics (beginner legs)
INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'c3d4e5f6-a7b8-9012-cdef-123456789012', id, 1, 4, 15, 60, 'Full depth, knees tracking over toes'
FROM exercise_library WHERE slug = 'squat';

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'c3d4e5f6-a7b8-9012-cdef-123456789012', id, 2, 3, 10, 60, 'Alternate legs, front knee over ankle'
FROM exercise_library WHERE slug = 'lunge';

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'c3d4e5f6-a7b8-9012-cdef-123456789012', id, 3, 3, 10, 90, 'Explosive jump, land softly'
FROM exercise_library WHERE slug = 'jump-squat';

-- Template 4: Core & Stability (beginner core)
INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'd4e5f6a7-b8c9-0123-def0-234567890123', id, 1, 3, 45, 60, 'Hold for 45 seconds, no hip sag'
FROM exercise_library WHERE slug = 'plank';

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'd4e5f6a7-b8c9-0123-def0-234567890123', id, 2, 3, 30, 60, 'Lower back pressed to floor, point toes'
FROM exercise_library WHERE slug = 'hollow-body-hold';

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'd4e5f6a7-b8c9-0123-def0-234567890123', id, 3, 3, 10, 60, 'Controlled movement, engage hip flexors'
FROM exercise_library WHERE slug = 'hanging-leg-raise';

-- Template 5: Full Body Strength (intermediate full_body)
INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'e5f6a7b8-c9d0-1234-ef01-345678901234', id, 1, 4, 8, 120, 'Control the negative portion'
FROM exercise_library WHERE slug = 'pull-up';

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'e5f6a7b8-c9d0-1234-ef01-345678901234', id, 2, 4, 12, 90, 'Chest to floor each rep'
FROM exercise_library WHERE slug = 'push-up';

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'e5f6a7b8-c9d0-1234-ef01-345678901234', id, 3, 4, 10, 90, 'Full depth parallel bar dips'
FROM exercise_library WHERE slug = 'dip';

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'e5f6a7b8-c9d0-1234-ef01-345678901234', id, 4, 4, 15, 90, 'Full depth, knees tracking over toes'
FROM exercise_library WHERE slug = 'squat';

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'e5f6a7b8-c9d0-1234-ef01-345678901234', id, 5, 3, 10, 60, 'Alternate legs, maintain balance'
FROM exercise_library WHERE slug = 'lunge';

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'e5f6a7b8-c9d0-1234-ef01-345678901234', id, 6, 3, 45, 60, 'Hold for 45 seconds, keep core tight'
FROM exercise_library WHERE slug = 'plank';

-- Template 6: Advanced Push Power (advanced push)
INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'f6a7b8c9-d0e1-2345-f012-456789012345', id, 1, 4, 5, 180, 'Wall supported, full range of motion'
FROM exercise_library WHERE slug = 'handstand-push-up';

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'f6a7b8c9-d0e1-2345-f012-456789012345', id, 2, 4, 8, 120, 'Deep dips, full extension'
FROM exercise_library WHERE slug = 'dip';

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'f6a7b8c9-d0e1-2345-f012-456789012345', id, 3, 3, 10, 90, 'Slow and controlled'
FROM exercise_library WHERE slug = 'diamond-push-up';

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'f6a7b8c9-d0e1-2345-f012-456789012345', id, 4, 3, 12, 90, 'Hips high, vertical press'
FROM exercise_library WHERE slug = 'pike-push-up';

-- Template 7: Advanced Pull Mastery (advanced pull)
INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'a7b8c9d0-e1f2-3456-0123-567890123456', id, 1, 4, 3, 180, 'Explosive pull, fast transition'
FROM exercise_library WHERE slug = 'muscle-up';

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'a7b8c9d0-e1f2-3456-0123-567890123456', id, 2, 4, 8, 120, 'Strict form, no kipping'
FROM exercise_library WHERE slug = 'pull-up';

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'a7b8c9d0-e1f2-3456-0123-567890123456', id, 3, 3, 15, 90, 'Toes to bar if possible'
FROM exercise_library WHERE slug = 'hanging-leg-raise';

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT 'a7b8c9d0-e1f2-3456-0123-567890123456', id, 4, 3, 20, 60, 'Work on time under tension'
FROM exercise_library WHERE slug = 'l-sit';

-- ============================================
-- DEFAULT USER DATA
-- ============================================

INSERT INTO users (id, email, first_name, last_name, profile_image_url, display_name, current_level, level_progress, streak, weight, last_workout_date)
VALUES (
  'local-user-123',
  'athlete@example.com',
  'John',
  'Athlete',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
  'John Athlete',
  2,
  45,
  12,
  85,
  NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO UPDATE SET
  display_name = 'John Athlete',
  current_level = 2,
  level_progress = 45,
  streak = 12,
  weight = 85,
  last_workout_date = NOW() - INTERVAL '1 day';

