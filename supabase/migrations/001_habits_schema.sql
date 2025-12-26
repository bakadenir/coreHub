-- Migration: Add missing columns to habits table
-- Run this in Supabase SQL Editor

-- Add missing columns to habits table
ALTER TABLE habits 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS icon VARCHAR(50),
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS specific_days INTEGER[],
ADD COLUMN IF NOT EXISTS reminder_time TIME,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Verify columns exist (optional check)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'habits';
