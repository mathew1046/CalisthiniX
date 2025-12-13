-- Migration: Add timing columns to workouts table
-- Run this to update existing databases

-- Add started_at column (when workout was started)
ALTER TABLE workouts 
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT NOW();

-- Add completed_at column (when workout was finished, nullable)
ALTER TABLE workouts 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Rename duration to duration_seconds for clarity (if it exists as duration)
-- Note: If your existing 'duration' column stores seconds, just keep it.
-- We'll use duration_seconds in new code, but keep backwards compatibility.
ALTER TABLE workouts 
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

-- Copy existing duration data to duration_seconds if needed
UPDATE workouts SET duration_seconds = duration WHERE duration_seconds IS NULL AND duration IS NOT NULL;

-- Add status column to know if workout is in-progress or completed
ALTER TABLE workouts 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed'));

-- Update existing workouts to be marked as completed (they were finished before this migration)
UPDATE workouts SET status = 'completed' WHERE status IS NULL OR status = 'in_progress';
UPDATE workouts SET completed_at = created_at WHERE completed_at IS NULL;
