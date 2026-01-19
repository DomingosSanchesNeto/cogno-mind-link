-- Drop the existing check constraint
ALTER TABLE public.participants DROP CONSTRAINT IF EXISTS participants_status_check;

-- Add new check constraint including 'abandoned' status
ALTER TABLE public.participants ADD CONSTRAINT participants_status_check 
CHECK (status IN ('in_progress', 'completed', 'declined', 'expired', 'abandoned'));