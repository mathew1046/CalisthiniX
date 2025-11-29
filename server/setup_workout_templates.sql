-- Create the workout_templates table
CREATE TABLE IF NOT EXISTS workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  category TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the workout_template_exercises table
CREATE TABLE IF NOT EXISTS workout_template_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercise_library(id),
  order_index INT NOT NULL,
  default_sets INT,
  default_reps INT,
  default_rest_seconds INT,
  notes TEXT
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_workout_templates_user_id ON workout_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_template_exercises_template_id ON workout_template_exercises(template_id);

-- Seed data: Insert 2 example templates for a fake user
-- First, let's insert the templates
INSERT INTO workout_templates (id, user_id, name, description, difficulty, category, is_public)
VALUES
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'fake-user-001',
    'Push Day Fundamentals',
    'A solid push workout focusing on chest, shoulders, and triceps using bodyweight exercises.',
    'beginner',
    'push',
    TRUE
  ),
  (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'fake-user-001',
    'Full Body Strength',
    'Complete full body workout hitting all major muscle groups. Great for building foundational strength.',
    'intermediate',
    'full-body',
    TRUE
  )
ON CONFLICT DO NOTHING;

-- Now insert the template exercises (linking to existing exercises in exercise_library)
-- Template 1: Push Day Fundamentals
INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  id,
  1,
  3,
  12,
  60,
  'Focus on full range of motion'
FROM exercise_library WHERE slug = 'push-up'
ON CONFLICT DO NOTHING;

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  id,
  2,
  3,
  8,
  90,
  'Keep elbows close to body'
FROM exercise_library WHERE slug = 'diamond-push-up'
ON CONFLICT DO NOTHING;

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  id,
  3,
  3,
  10,
  90,
  'Great for shoulder development'
FROM exercise_library WHERE slug = 'pike-push-up'
ON CONFLICT DO NOTHING;

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  id,
  4,
  3,
  8,
  90,
  'Go to 90 degrees for full activation'
FROM exercise_library WHERE slug = 'dip'
ON CONFLICT DO NOTHING;

-- Template 2: Full Body Strength
INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  id,
  1,
  4,
  8,
  120,
  'Control the negative portion'
FROM exercise_library WHERE slug = 'pull-up'
ON CONFLICT DO NOTHING;

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  id,
  2,
  4,
  12,
  90,
  'Chest to floor each rep'
FROM exercise_library WHERE slug = 'push-up'
ON CONFLICT DO NOTHING;

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  id,
  3,
  4,
  15,
  90,
  'Full depth, knees tracking over toes'
FROM exercise_library WHERE slug = 'squat'
ON CONFLICT DO NOTHING;

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  id,
  4,
  3,
  10,
  60,
  'Alternate legs, maintain balance'
FROM exercise_library WHERE slug = 'lunge'
ON CONFLICT DO NOTHING;

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  id,
  5,
  3,
  45,
  60,
  'Hold for 45 seconds, keep core tight'
FROM exercise_library WHERE slug = 'plank'
ON CONFLICT DO NOTHING;

INSERT INTO workout_template_exercises (template_id, exercise_id, order_index, default_sets, default_reps, default_rest_seconds, notes)
SELECT
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  id,
  6,
  3,
  12,
  90,
  'Control the movement, no swinging'
FROM exercise_library WHERE slug = 'hanging-leg-raise'
ON CONFLICT DO NOTHING;
