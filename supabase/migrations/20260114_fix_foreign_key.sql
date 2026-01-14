-- CRITICAL FIX: Remove foreign key constraint that's blocking signup
-- This allows profiles to be created even if auth.users isn't immediately synced

ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;

-- Add new foreign key with ON DELETE CASCADE
ALTER TABLE profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
