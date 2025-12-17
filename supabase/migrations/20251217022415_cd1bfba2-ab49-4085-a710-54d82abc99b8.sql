-- Fix function search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Add policies for admin_users table (only authenticated admins can read their own data)
CREATE POLICY "Admin users cannot be read publicly" ON public.admin_users FOR SELECT USING (false);

-- Add SELECT policy for participants (admin only via edge function)
CREATE POLICY "No public select on participants" ON public.participants FOR SELECT USING (false);
CREATE POLICY "No public select on sociodemographic" ON public.sociodemographic_data FOR SELECT USING (false);
CREATE POLICY "No public select on aut_responses" ON public.aut_responses FOR SELECT USING (false);
CREATE POLICY "No public select on fiq_responses" ON public.fiq_responses FOR SELECT USING (false);
CREATE POLICY "No public select on dilemma_responses" ON public.dilemma_responses FOR SELECT USING (false);
CREATE POLICY "No public select on screen_timestamps" ON public.screen_timestamps FOR SELECT USING (false);