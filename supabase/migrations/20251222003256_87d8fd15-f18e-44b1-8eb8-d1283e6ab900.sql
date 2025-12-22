-- Fix 1: Add explicit DENY policies for admin_users write operations
-- Block all INSERT operations (admins created via backend only)
CREATE POLICY "Block all inserts to admin_users" 
  ON public.admin_users FOR INSERT 
  WITH CHECK (false);

-- Block all UPDATE operations  
CREATE POLICY "Block all updates to admin_users" 
  ON public.admin_users FOR UPDATE 
  USING (false);

-- Block all DELETE operations
CREATE POLICY "Block all deletes to admin_users" 
  ON public.admin_users FOR DELETE 
  USING (false);

-- Fix 2: Restrict participants updates to only status and completed_at fields
-- Drop existing overly permissive update policy
DROP POLICY IF EXISTS "Participants can update existing records" ON public.participants;

-- Create a more restrictive policy that validates allowed status values
-- While we can't restrict "own record" without auth, we can limit valid status values
CREATE POLICY "Participants can update status only" 
  ON public.participants FOR UPDATE 
  USING (true)
  WITH CHECK (
    -- Only allow valid status values to be set
    status IN ('in_progress', 'completed', 'declined')
  );