-- Calyxpert Database Schema
-- This file creates all necessary tables for the application
-- Run this before seed.sql

-- ============================================
-- CORE USER TABLES
-- ============================================

-- Session storage table for authentication
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_session_expire ON sessions(expire);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  display_name TEXT,
  current_level INTEGER NOT NULL DEFAULT 0,
  level_progress INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  last_workout_date TIMESTAMP,
  weight INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- WORKOUT TRACKING TABLES
-- ============================================

-- Workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration INTEGER,
  duration_seconds INTEGER,
  total_volume INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Exercises (workout exercises - sets performed)
CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  workout_id INTEGER NOT NULL REFERENCES workouts(id),
  name TEXT NOT NULL,
  sets JSONB NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

-- ============================================
-- EXERCISE LIBRARY TABLE
-- ============================================

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

CREATE INDEX IF NOT EXISTS idx_exercise_library_name ON exercise_library(name);
CREATE INDEX IF NOT EXISTS idx_exercise_library_category ON exercise_library(category);
CREATE INDEX IF NOT EXISTS idx_exercise_library_difficulty ON exercise_library(difficulty);

-- ============================================
-- WORKOUT TEMPLATES TABLES
-- ============================================

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

CREATE INDEX IF NOT EXISTS idx_workout_templates_user_id ON workout_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_template_exercises_template_id ON workout_template_exercises(template_id);

-- ============================================
-- JOURNAL & PERSONAL RECORDS
-- ============================================

CREATE TABLE IF NOT EXISTS journal_entries (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  energy_level INTEGER NOT NULL,
  mood INTEGER NOT NULL,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS personal_records (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  exercise_name TEXT NOT NULL,
  value TEXT NOT NULL,
  achieved_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- FUTURE TABLES (Placeholder for planned features)
-- ============================================

-- Workout Splits (for daily schedule with templates)
-- CREATE TABLE IF NOT EXISTS workout_splits (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id TEXT NOT NULL,
--   name TEXT NOT NULL,
--   description TEXT,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- CREATE TABLE IF NOT EXISTS workout_split_days (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   split_id UUID NOT NULL REFERENCES workout_splits(id) ON DELETE CASCADE,
--   day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
--   template_id UUID REFERENCES workout_templates(id),
--   is_rest_day BOOLEAN DEFAULT FALSE
-- );

-- Daily Streak Tracking
-- CREATE TABLE IF NOT EXISTS streak_history (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id TEXT NOT NULL,
--   date DATE NOT NULL,
--   workout_completed BOOLEAN DEFAULT FALSE,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );

