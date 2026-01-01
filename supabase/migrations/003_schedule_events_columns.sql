-- Add missing columns to schedule_events table
ALTER TABLE public.schedule_events 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'blue',
ADD COLUMN IF NOT EXISTS is_all_day BOOLEAN DEFAULT false;

-- Update existing rows to have default values
UPDATE public.schedule_events SET color = 'blue' WHERE color IS NULL;
UPDATE public.schedule_events SET is_all_day = false WHERE is_all_day IS NULL;
