-- Add currency codes and convert existing USD amounts to KES
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'KES';

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'KES';

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'KES';

-- Convert existing rows that were stored as USD to KES
-- Assumes historical values are USD when currency_code is null or USD
UPDATE products
SET
  price = price * 150,
  original_price = CASE WHEN original_price IS NULL THEN NULL ELSE original_price * 150 END,
  currency_code = 'KES'
WHERE currency_code IS NULL OR currency_code = 'USD';

UPDATE orders
SET
  total = total * 150,
  subtotal = subtotal * 150,
  tax = tax * 150,
  shipping_cost = shipping_cost * 150,
  currency_code = 'KES'
WHERE currency_code IS NULL OR currency_code = 'USD';

UPDATE order_items
SET
  unit_price = unit_price * 150,
  currency_code = 'KES'
WHERE currency_code IS NULL OR currency_code = 'USD';
