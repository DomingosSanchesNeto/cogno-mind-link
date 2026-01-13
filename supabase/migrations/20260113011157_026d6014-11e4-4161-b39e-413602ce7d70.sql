-- Remove the unused admin_users table which poses a security risk
-- Current admin authentication uses ADMIN_PASSWORD environment variable with JWT tokens
-- This table is not used and exposes password_hash column structure via schema introspection

DROP TABLE IF EXISTS public.admin_users;