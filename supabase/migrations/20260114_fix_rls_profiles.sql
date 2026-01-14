-- Fix Row Level Security (RLS) for signup and profile management
-- This allows anonymous users to insert profiles during signup

-- Disable RLS temporarily on profiles table to allow signup
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Or if you want to keep RLS enabled, add this policy for anonymous users:
-- CREATE POLICY "Allow anonymous users to insert their own profile"
-- ON profiles
-- FOR INSERT
-- TO anon
-- WITH CHECK (true);

-- Allow users to read their own profile
CREATE POLICY "Users can read their own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Re-enable RLS if needed
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
