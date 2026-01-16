# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Supabase account (free tier works)

## Setup Steps

### 1. Clone and Install

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to Settings > API
3. Copy your:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep secret!)

4. Go to SQL Editor and run the SQL from `backend/database/schema.sql`

### 3. Configure Environment Variables

**Frontend** (`frontend/.env`):
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key (optional for now)
```

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
FRONTEND_URL=http://localhost:3000

# Payment providers (optional for basic setup)
STRIPE_SECRET_KEY=your_stripe_secret
PAYPAL_CLIENT_ID=your_paypal_id
PAYPAL_CLIENT_SECRET=your_paypal_secret

# Email/SMS (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_password
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

### 4. Add Sample Data (Optional)

You can add sample products through Supabase dashboard or use this SQL:

```sql
INSERT INTO products (name, brand, description, price, images, gender, shoe_type, sizes, colors, material, stock_quantity, featured)
VALUES 
  ('Classic Sneakers', 'Nike', 'Comfortable everyday sneakers', 99.99, ARRAY['https://example.com/shoe1.jpg'], 'unisex', 'sneakers', ARRAY['7', '8', '9', '10', '11'], ARRAY['Black', 'White'], 'Leather', 50, true),
  ('Running Shoes', 'Adidas', 'Perfect for running', 129.99, ARRAY['https://example.com/shoe2.jpg'], 'male', 'sneakers', ARRAY['8', '9', '10', '11'], ARRAY['Blue', 'Red'], 'Mesh', 30, true);
```

### 5. Run the Application

From the root directory:

```bash
npm run dev
```

This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:5000

Or run them separately:

```bash
# Terminal 1 - Frontend
cd frontend && npm run dev

# Terminal 2 - Backend
cd backend && npm run dev
```

### 6. Test the Application

1. Open http://localhost:3000 in your browser
2. Browse products
3. Create an account (Register)
4. Add products to cart
5. Test checkout flow

## Common Issues

### Port Already in Use
- Change ports in `vite.config.js` (frontend) or `backend/.env` (backend)

### Supabase Connection Error
- Verify your Supabase URL and keys are correct
- Check that RLS policies allow public access to products table

### CORS Errors
- Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL

### Module Not Found
- Run `npm install` in both frontend and backend directories
- Delete `node_modules` and reinstall if issues persist

## Next Steps

- Set up payment providers (Stripe, PayPal)
- Configure email/SMS services
- Deploy to production (see DEPLOYMENT.md)
- Add more products through admin panel or Supabase dashboard

## Features to Test

✅ Product catalog with filters
✅ Product detail pages
✅ Shopping cart
✅ User authentication
✅ Wishlist
✅ Product comparison
✅ Order tracking (basic)

## Need Help?

- Check the README.md for detailed feature list
- Review DEPLOYMENT.md for production setup
- Check Supabase documentation for database queries
