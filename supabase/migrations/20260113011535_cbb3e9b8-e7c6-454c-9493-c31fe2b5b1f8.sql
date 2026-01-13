-- Fix overly permissive UPDATE policy on participants table
-- Remove direct UPDATE capability - updates will be handled via edge function
-- This prevents unauthorized modification of participant records

DROP POLICY IF EXISTS "Participants can update own status" ON public.participants;

-- Block all direct updates - must go through edge function
CREATE POLICY "Block direct updates to participants"
ON public.participants
FOR UPDATE
USING (false)
WITH CHECK (false);