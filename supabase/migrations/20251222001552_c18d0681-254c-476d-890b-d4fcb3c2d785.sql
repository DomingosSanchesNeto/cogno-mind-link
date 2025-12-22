-- Fix storage bucket security: restrict uploads to service role only (via Edge Function)
-- Drop the public upload policy that allows anyone to upload
DROP POLICY IF EXISTS "Anyone can upload experiment files" ON storage.objects;

-- Keep public read access for experiment images/files
-- The existing "Public can read experiment files" policy remains

-- Create a deny policy for INSERT to ensure no direct client uploads
-- Only the Edge Function with service role key can upload
CREATE POLICY "Block direct client uploads to experiment-files" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'experiment-files' 
    AND auth.role() = 'service_role'
  );