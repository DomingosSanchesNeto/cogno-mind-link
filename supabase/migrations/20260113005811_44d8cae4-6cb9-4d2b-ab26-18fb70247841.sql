-- Add foreign key constraint if not exists (ensures referential integrity)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'sociodemographic_data_participant_id_fkey'
    AND table_name = 'sociodemographic_data'
  ) THEN
    ALTER TABLE public.sociodemographic_data 
    ADD CONSTRAINT sociodemographic_data_participant_id_fkey 
    FOREIGN KEY (participant_id) REFERENCES public.participants(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create a security definer function to validate participant exists
CREATE OR REPLACE FUNCTION public.participant_exists(p_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.participants WHERE id = p_id
  )
$$;

-- Drop the old permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can insert sociodemographic data" ON public.sociodemographic_data;

-- Create a more restrictive INSERT policy that validates participant exists
CREATE POLICY "Insert only for valid participants"
ON public.sociodemographic_data
FOR INSERT
WITH CHECK (public.participant_exists(participant_id));

-- Also apply same pattern to other response tables for consistency
DROP POLICY IF EXISTS "Anyone can insert AUT responses" ON public.aut_responses;
CREATE POLICY "Insert only for valid participants - AUT"
ON public.aut_responses
FOR INSERT
WITH CHECK (public.participant_exists(participant_id));

DROP POLICY IF EXISTS "Anyone can insert FIQ responses" ON public.fiq_responses;
CREATE POLICY "Insert only for valid participants - FIQ"
ON public.fiq_responses
FOR INSERT
WITH CHECK (public.participant_exists(participant_id));

DROP POLICY IF EXISTS "Anyone can insert dilemma responses" ON public.dilemma_responses;
CREATE POLICY "Insert only for valid participants - dilemma"
ON public.dilemma_responses
FOR INSERT
WITH CHECK (public.participant_exists(participant_id));

DROP POLICY IF EXISTS "Anyone can insert screen timestamps" ON public.screen_timestamps;
CREATE POLICY "Insert only for valid participants - timestamps"
ON public.screen_timestamps
FOR INSERT
WITH CHECK (public.participant_exists(participant_id));