-- Add content_type column to notes table
ALTER TABLE public.notes 
ADD COLUMN content_type text DEFAULT 'rich' CHECK (content_type IN ('rich', 'markdown'));

-- Update existing rows to have default value
UPDATE public.notes SET content_type = 'rich' WHERE content_type IS NULL;
