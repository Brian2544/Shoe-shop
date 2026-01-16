# Database Migration Guide

## Overview

This guide explains how to set up the Supabase database schema for the Shoe E-Commerce Platform.

## Prerequisites

- Supabase account and project created
- Access to Supabase Dashboard (SQL Editor)
- Backend and frontend environment variables configured

## Migration Options

### Option 1: Supabase SQL Editor (Recommended for Quick Setup)

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor** in the left sidebar

2. **Run the Migration**
   - Open the file: `backend/database/migration_001_initial_schema.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **Run** (or press Ctrl+Enter)

3. **Verify Tables Created**
   - Go to **Table Editor** in the left sidebar
   - You should see these tables:
     - `products`
     - `profiles`
     - `addresses`
     - `orders`
     - `order_items`
     - `reviews`
     - `wishlist`
     - `loyalty_points`
     - `referrals`
     - `promo_codes`
     - `admin_audit_logs`

### Option 2: Supabase CLI (For Development)

If you have Supabase CLI installed:

```bash
# Initialize Supabase (if not already done)
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

Or manually:

```bash
# Apply migration
supabase migration up
```

## Post-Migration Steps

### 1. Set Admin Emails

**Backend** (`.env`):
```env
ADMIN_EMAILS=admin@example.com,another-admin@example.com
```

**Frontend** (`.env`):
```env
VITE_ADMIN_EMAILS=admin@example.com,another-admin@example.com
```

**Important**: Use the same email addresses in both files.

### 2. Create Your First Admin User

1. **Sign up** through the frontend registration page with an admin email
2. The system will automatically:
   - Create a profile row
   - Set role to 'admin' if email is in ADMIN_EMAILS list

OR manually set via SQL:

```sql
-- Replace 'admin@example.com' with your actual admin email
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

### 3. Verify RLS Policies

All tables have Row Level Security (RLS) enabled. Policies are automatically created by the migration.

### 4. Test Admin Access

1. Log in with an admin email
2. You should be automatically redirected to `/admin/dashboard`
3. Verify you can access admin-only features

## Troubleshooting

### Tables Not Appearing

- **Check SQL Editor**: Look for error messages in the SQL Editor output
- **Check Permissions**: Ensure you have the correct project permissions
- **Re-run Migration**: The migration uses `IF NOT EXISTS`, so it's safe to re-run

### Admin Redirect Not Working

1. **Check Environment Variables**:
   - Verify `ADMIN_EMAILS` is set in backend `.env`
   - Verify `VITE_ADMIN_EMAILS` is set in frontend `.env`
   - Restart both servers after changing env vars

2. **Check Email Match**:
   - Email must match exactly (case-insensitive)
   - Check for extra spaces or typos

3. **Check Profile Role**:
   ```sql
   SELECT id, email, role FROM profiles WHERE email = 'your-admin@email.com';
   ```

### RLS Policy Errors

If you see "permission denied" errors:

1. **Check Policies**: Verify policies exist:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'products';
   ```

2. **Check User Context**: Ensure you're authenticated when making requests

3. **Service Role**: Backend uses service role key (bypasses RLS) - this is correct

## Schema Overview

### Core Tables

- **products**: Shoe catalog with all product details
- **profiles**: User profiles linked to `auth.users`
- **orders**: Customer orders
- **order_items**: Individual items in orders (normalized)
- **reviews**: Product reviews and ratings

### Supporting Tables

- **addresses**: User delivery addresses
- **wishlist**: User wishlists
- **loyalty_points**: Loyalty program tracking
- **referrals**: Referral program
- **promo_codes**: Discount codes
- **admin_audit_logs**: Admin action logging

## Next Steps

1. ✅ Run migration
2. ✅ Set admin emails in environment variables
3. ✅ Create admin user account
4. ✅ Test admin login and redirect
5. ✅ Add sample products (via admin dashboard or SQL)
6. ✅ Test product display on homepage

## Support

If you encounter issues:

1. Check the Debug page: `http://localhost:3000/debug`
2. Check backend logs for errors
3. Verify all environment variables are set
4. Check Supabase dashboard for table existence
