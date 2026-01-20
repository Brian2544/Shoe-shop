-- Ensure profiles has a role column and index for admin authorization
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
