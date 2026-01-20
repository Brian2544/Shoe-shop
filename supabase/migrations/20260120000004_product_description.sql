-- Ensure products.description exists for admin CRUD
ALTER TABLE products
ADD COLUMN IF NOT EXISTS description TEXT;
