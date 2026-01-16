-- Admin Setup Script
-- Run this script to set up admin functionality

-- Add role column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Create index on role for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Example: Set a user as admin (replace USER_EMAIL with actual email)
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@shoestore.com';

-- Alternative: Set admin via user metadata in Supabase Dashboard
-- Go to Authentication > Users > Select user > Edit user metadata
-- Add: { "role": "admin" } to user_metadata or app_metadata

-- RLS Policy: Allow admins to view all profiles
CREATE POLICY IF NOT EXISTS "Admins can view all profiles" 
ON profiles FOR SELECT 
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ) OR auth.uid() = id
);

-- RLS Policy: Allow admins to update all profiles
CREATE POLICY IF NOT EXISTS "Admins can update all profiles" 
ON profiles FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- RLS Policy: Allow admins to view all orders
CREATE POLICY IF NOT EXISTS "Admins can view all orders" 
ON orders FOR SELECT 
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ) OR auth.uid() = user_id
);

-- RLS Policy: Allow admins to update all orders
CREATE POLICY IF NOT EXISTS "Admins can update all orders" 
ON orders FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- RLS Policy: Allow admins to insert products
CREATE POLICY IF NOT EXISTS "Admins can insert products" 
ON products FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- RLS Policy: Allow admins to update products
CREATE POLICY IF NOT EXISTS "Admins can update products" 
ON products FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- RLS Policy: Allow admins to delete products
CREATE POLICY IF NOT EXISTS "Admins can delete products" 
ON products FOR DELETE 
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);
