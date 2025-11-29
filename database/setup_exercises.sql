-- Create the exercise_library table
CREATE TABLE IF NOT EXISTS exercise_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT CHECK (category IN ('push', 'pull', 'legs', 'core', 'skill')),
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  short_description TEXT,
  long_description TEXT,
  progressions JSONB DEFAULT '[]'::jsonb,
  regressions JSONB DEFAULT '[]'::jsonb,
  muscles_primary TEXT[],
  muscles_secondary TEXT[],
  equipment TEXT[],
  demo_image_url TEXT,
  demo_gif_url TEXT,
  tips TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for search and filtering
CREATE INDEX IF NOT EXISTS idx_exercise_library_name ON exercise_library(name);
CREATE INDEX IF NOT EXISTS idx_exercise_library_category ON exercise_library(category);
CREATE INDEX IF NOT EXISTS idx_exercise_library_difficulty ON exercise_library(difficulty);

-- Delete existing data to avoid conflicts
DELETE FROM exercise_library;

-- Insert comprehensive calisthenics exercises
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
  (' Front Lever', 'front-lever', 'pull', 'advanced', 'Horizontal static hold.', 'Hang from bar. Raise body parallel to ground forming straight line.', '["Front Lever Pulls"]', '["Tuck Front Lever"]', ARRAY['Lats', 'Core'], ARRAY['Biceps', 'Forearms'], ARRAY['Pull-up Bar'], 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format', ARRAY['Depress scapula', 'Push bar down']);
