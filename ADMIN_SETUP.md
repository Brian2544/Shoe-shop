# Admin Dashboard Setup Guide

## Overview
The admin dashboard allows authorized users to manage products, view orders, and access administrative features.

## Access URLs

- **Admin Login**: `http://localhost:3000/admin/login`
- **Admin Dashboard**: `http://localhost:3000/admin/dashboard`

## Setting Up an Admin User

### Option 1: Using Database (Recommended)

1. **Run the admin setup SQL script**:
   ```sql
   -- In Supabase SQL Editor, run:
   -- backend/database/admin_setup.sql
   ```

2. **Create a user account** (if you don't have one):
   - Go to `http://localhost:3000/register`
   - Register with your email and password

3. **Set user as admin in database**:
   ```sql
   -- Replace 'your-email@example.com' with your actual email
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```

### Option 2: Using Supabase Dashboard (Alternative)

1. **Go to Supabase Dashboard** → Authentication → Users
2. **Find your user** or create a new one
3. **Click on the user** to edit
4. **Add to User Metadata**:
   ```json
   {
     "role": "admin"
   }
   ```
   OR add to **App Metadata**:
   ```json
   {
     "role": "admin"
   }
   ```

### Option 3: Using Supabase CLI

```bash
# Set user role via Supabase CLI
supabase db execute "
  UPDATE profiles 
  SET role = 'admin' 
  WHERE email = 'admin@shoestore.com';
"
```

## Logging In as Admin

1. Navigate to `http://localhost:3000/admin/login`
2. Enter your admin email and password
3. The system will verify your admin role and redirect you to the dashboard

## Admin Dashboard Features

### Overview Tab
- Statistics cards showing:
  - Total Products
  - Total Orders
  - Total Users
  - Total Revenue
- Recent orders and top products

### Orders Tab
- View all orders
- Order details (ID, user, total, status, date)
- Filter and manage orders

### Products Tab
- View all products
- Add new products
- Edit existing products
- Delete products

## Backend API Endpoints

All admin endpoints require authentication and are prefixed with `/api/admin`:

- `GET /api/admin/orders` - Get all orders
- `POST /api/admin/products` - Create a product
- `PATCH /api/admin/products/:id` - Update a product
- `DELETE /api/admin/products/:id` - Delete a product

## Security Notes

1. **Authentication**: All admin routes require a valid JWT token
2. **Authorization**: Users must have `role = 'admin'` in their profile or metadata
3. **Token**: The frontend automatically includes the auth token in API requests
4. **RLS Policies**: Database Row Level Security policies restrict access to admin-only operations

## Troubleshooting

### "Access denied. Admin privileges required."
- Verify the user has `role = 'admin'` in the `profiles` table
- Check user metadata in Supabase Dashboard
- Ensure you're logged in with the correct account

### "No authentication token provided"
- Make sure you're logged in via `/admin/login`
- Check browser console for authentication errors
- Verify Supabase credentials are configured

### Dashboard shows "Loading..."
- Check browser console for errors
- Verify backend server is running on port 5000
- Check network tab for failed API requests

## Creating Additional Admin Users

To create more admin users, simply update their profile:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'another-admin@example.com';
```

Or use the Supabase Dashboard to add `"role": "admin"` to their user metadata.
