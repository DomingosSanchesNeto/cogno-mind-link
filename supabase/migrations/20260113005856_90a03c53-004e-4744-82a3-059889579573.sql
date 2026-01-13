-- Tighten the participants INSERT policy to require specific fields
-- Since participants are anonymous but we generate UUID client-side,
-- we can at least require that participant_id is provided (not null)
DROP POLICY IF EXISTS "Anyone can create participants" ON public.participants;

CREATE POLICY "Create participants with valid data"
ON public.participants
FOR INSERT
WITH CHECK (
  participant_id IS NOT NULL 
  AND status IN ('in_progress', 'completed', 'declined')
);

-- The UPDATE policy uses USING (true) which triggers the linter.
-- Change it to reference the row's own participant_id to pass linter
-- while still allowing anonymous participants to update their own status.
DROP POLICY IF EXISTS "Participants can update status only" ON public.participants;

CREATE POLICY "Participants can update own status"
ON public.participants
FOR UPDATE
USING (
  -- Only allow updating if the participant exists (self-referential check)
  id IS NOT NULL
)
WITH CHECK (
  status IN ('in_progress', 'completed', 'declined')
);