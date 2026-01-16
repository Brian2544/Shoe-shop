# Setup Checklist - Complete Implementation Guide

## ✅ Pre-Migration Checklist

- [ ] Supabase project created
- [ ] Backend `.env` file configured with:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ADMIN_EMAILS` (comma-separated, e.g., `admin@example.com,another@example.com`)
- [ ] Frontend `.env` file configured with:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_API_URL`
  - `VITE_ADMIN_EMAILS` (same emails as backend)

## ✅ Migration Steps

### Step 1: Run Database Migration

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `backend/database/migration_001_initial_schema.sql`
3. Paste and run in SQL Editor
4. Verify no errors in output

### Step 2: Verify Tables Created

1. Go to Table Editor in Supabase Dashboard
2. Confirm these tables exist:
   - ✅ `products`
   - ✅ `profiles`
   - ✅ `addresses`
   - ✅ `orders`
   - ✅ `order_items`
   - ✅ `reviews`
   - ✅ `wishlist`
   - ✅ `loyalty_points`
   - ✅ `referrals`
   - ✅ `promo_codes`
   - ✅ `admin_audit_logs`

### Step 3: Verify RLS Policies

Run this SQL to check policies:

```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

You should see policies for all tables.

## ✅ Admin Setup

### Step 1: Set Admin Emails

**Backend** (`backend/.env`):
```env
ADMIN_EMAILS=admin@example.com,another-admin@example.com
```

**Frontend** (`frontend/.env`):
```env
VITE_ADMIN_EMAILS=admin@example.com,another-admin@example.com
```

**Important**: 
- Use the same emails in both files
- Emails are case-insensitive
- Separate multiple emails with commas (no spaces)

### Step 2: Create Admin User

**Option A: Register via Frontend (Recommended)**
1. Go to `http://localhost:3000/register`
2. Register with an email from `ADMIN_EMAILS` list
3. System will automatically set role to 'admin'

**Option B: Manual SQL Update**
```sql
-- Replace with your admin email
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

### Step 3: Test Admin Login

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Go to `http://localhost:3000/login`
4. Log in with admin email
5. **Expected**: Automatically redirected to `/admin/dashboard`
6. **If not redirected**: Check Debug page at `/debug`

## ✅ Verification Steps

### 1. Check Backend Health

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "ok": true,
  "timestamp": "...",
  "uptime": 123.45,
  "environment": "development",
  "supabaseConfigured": true
}
```

### 2. Check Config Status (Dev Only)

```bash
curl http://localhost:5000/api/config-status
```

Expected response:
```json
{
  "supabaseUrlHost": "your-project.supabase.co",
  "supabaseConfigured": true,
  "adminEmailsCount": 1,
  "environment": "development"
}
```

### 3. Check Frontend Debug Page

1. Navigate to `http://localhost:3000/debug`
2. Verify:
   - ✅ Backend Health: Online
   - ✅ Supabase configured: Yes
   - ✅ Auth Status: Shows your login status
   - ✅ Is Admin: True (if logged in as admin)
   - ✅ Products count: Shows number (even if 0)

### 4. Test Admin Redirect

1. Log out (if logged in)
2. Go to `/login`
3. Enter admin email and password
4. **Expected**: Redirected to `/admin/dashboard`
5. **If redirected to `/`**: Check `VITE_ADMIN_EMAILS` in frontend `.env`

### 5. Test Non-Admin Login

1. Log out
2. Register/login with a non-admin email
3. **Expected**: Redirected to `/` (homepage)
4. **If redirected to `/admin/dashboard`**: Check `ADMIN_EMAILS` configuration

## ✅ Product Management Test

### 1. Add a Product (Admin Only)

1. Log in as admin
2. Go to `/admin/dashboard`
3. Click "Products" tab
4. Click "Add Product"
5. Fill in product details
6. Save

### 2. Verify Product on Homepage

1. Go to `/` (homepage)
2. **Expected**: Product appears in "Featured Products" section
3. If no products: Shows empty state with "Browse All Products" button

### 3. Verify Product on Products Page

1. Go to `/products`
2. **Expected**: Product appears in grid
3. If no products: Shows "No products found" with filter options

## ✅ Troubleshooting

### Tables Not Appearing

**Symptoms**: Supabase dashboard shows "No tables created yet"

**Solutions**:
1. Check SQL Editor for errors
2. Re-run migration (safe to re-run, uses `IF NOT EXISTS`)
3. Verify you're in the correct Supabase project

### Admin Redirect Not Working

**Symptoms**: Admin logs in but goes to `/` instead of `/admin/dashboard`

**Solutions**:
1. Check `VITE_ADMIN_EMAILS` in frontend `.env`
2. Verify email matches exactly (case-insensitive)
3. Restart frontend dev server after changing `.env`
4. Check browser console for errors
5. Visit `/debug` page to verify admin status

### Blank UI / No Products

**Symptoms**: Homepage shows blank or error

**Solutions**:
1. Check backend is running (`/api/health`)
2. Check products table has data
3. Verify RLS policies allow public read on products
4. Check browser console for API errors
5. Visit `/debug` page for diagnostics

### Permission Denied Errors

**Symptoms**: "permission denied" or 403 errors

**Solutions**:
1. Verify RLS policies are created (see Step 3 above)
2. Check user is authenticated (check `/debug`)
3. For admin operations: Verify admin email is in `ADMIN_EMAILS`
4. Check backend uses service role key (bypasses RLS)

## ✅ Final Checklist

Before considering setup complete:

- [ ] Migration run successfully
- [ ] All tables visible in Supabase dashboard
- [ ] RLS policies created and enabled
- [ ] Admin emails configured in both frontend and backend `.env`
- [ ] Admin user created and can log in
- [ ] Admin redirect works (admin → `/admin/dashboard`)
- [ ] Non-admin redirect works (user → `/`)
- [ ] Debug page shows correct status
- [ ] Backend health endpoint responds
- [ ] Products can be added via admin dashboard
- [ ] Products display on homepage (or show empty state)
- [ ] No console errors in browser
- [ ] No errors in backend logs

## 📝 Next Steps After Setup

1. **Add Sample Products**: Use admin dashboard or SQL
2. **Configure Storage**: Set up Supabase Storage bucket for product images
3. **Test Full Flow**: Register → Browse → Add to Cart → Checkout
4. **Set Up Payments**: Configure Stripe/PayPal credentials
5. **Deploy**: Follow `DEPLOYMENT.md` for production setup

## 🆘 Getting Help

If you encounter issues:

1. Check `/debug` page for system status
2. Review browser console for frontend errors
3. Check backend logs for API errors
4. Verify all environment variables are set
5. Review `MIGRATION_GUIDE.md` for detailed migration info
6. Check Supabase dashboard for table/policy status

---

**Setup Complete!** 🎉

Your Shoe E-Commerce platform is now ready with:
- ✅ Complete database schema
- ✅ Admin authentication and redirect
- ✅ Row Level Security policies
- ✅ Empty state handling
- ✅ Debug and health endpoints
