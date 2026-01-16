# Deployment Guide

## Prerequisites

1. **Supabase Account**: Create a project at [supabase.com](https://supabase.com)
2. **Vercel Account**: For frontend deployment
3. **Cloud Platform Account**: AWS, Heroku, or DigitalOcean for backend
4. **Payment Provider Accounts**: Stripe, PayPal, M-Pesa (if applicable)

## Step 1: Set Up Supabase

1. Create a new Supabase project
2. Run the SQL schema from `backend/database/schema.sql` in the Supabase SQL Editor
3. Go to Settings > API and copy:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep this secret!)

## Step 2: Deploy Frontend to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Set build settings:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=https://your-backend-url.com/api
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```
5. Deploy!

## Step 3: Deploy Backend

### Option A: Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables:
   ```bash
   heroku config:set SUPABASE_URL=your_supabase_url
   heroku config:set SUPABASE_SERVICE_KEY=your_service_key
   heroku config:set STRIPE_SECRET_KEY=your_stripe_secret
   # ... add all other env vars
   ```
5. Deploy: `git push heroku main`

### Option B: DigitalOcean App Platform

1. Connect your GitHub repository
2. Create a new App
3. Add environment variables in the dashboard
4. Set build command: `cd backend && npm install`
5. Set run command: `cd backend && npm start`

### Option C: AWS EC2

1. Launch an EC2 instance
2. Install Node.js and PM2
3. Clone your repository
4. Install dependencies: `npm install`
5. Set environment variables
6. Start with PM2: `pm2 start backend/server.js`

## Step 4: Configure Domain & SSL

- Vercel automatically provides SSL
- For backend, use Let's Encrypt or your cloud provider's SSL service

## Step 5: Set Up Payment Providers

### Stripe
1. Create account at [stripe.com](https://stripe.com)
2. Get API keys from dashboard
3. Set up webhooks for payment confirmation

### PayPal
1. Create account at [paypal.com](https://paypal.com)
2. Get client ID and secret from developer dashboard
3. Configure return URLs

### M-Pesa
1. Register for M-Pesa API access
2. Get consumer key and secret
3. Configure callback URLs

## Step 6: Email & SMS Setup

### Email (Nodemailer)
- Use Gmail SMTP or a service like SendGrid
- For Gmail, enable "Less secure app access" or use App Passwords

### SMS (Twilio)
1. Create account at [twilio.com](https://twilio.com)
2. Get Account SID and Auth Token
3. Get a phone number

## Monitoring & Maintenance

- Set up error tracking (Sentry, LogRocket)
- Monitor server logs
- Set up database backups in Supabase
- Configure auto-scaling for backend

## Troubleshooting

- Check environment variables are set correctly
- Verify CORS settings allow your frontend domain
- Check Supabase RLS policies
- Verify payment webhooks are configured
- Check server logs for errors
