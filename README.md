# Shoe E-Commerce Platform

A modern, full-stack e-commerce application for selling shoes with advanced features including real-time tracking, multiple payment options, and comprehensive marketing tools.

## 🚀 Features

### Product Catalog
- Advanced filtering (gender, price, material, shoe type, brand, color, size)
- Product zoom for detailed inspection
- Real-time stock availability
- Product comparison tool
- Wishlist functionality
- Detailed product descriptions with size charts

### Checkout & Payments
- Secure checkout process
- Guest checkout option
- Multiple payment methods:
  - Stripe (Credit Cards)
  - PayPal
  - M-Pesa
- Promo codes and discounts
- EMI/Installment payment options
- One-click reorder
- Tax and shipping auto-calculation

### Delivery & Tracking
- Free delivery threshold
- Delivery time estimation
- Real-time order tracking (Socket.io)
- Click & Collect option
- Multiple delivery addresses
- Eco-delivery option
- Return/Exchange system

### Marketing & Engagement
- Customer reviews & ratings with photo uploads
- Personalized product recommendations
- Email & SMS marketing integration
- Push notifications
- Referral program
- Loyalty points system
- Social media integration

### Advanced Features
- AI Shoe Size Recommender
- Multi-language & multi-currency support
- Store locator with maps
- Affiliate program
- Gift card system
- Chatbot/Live chat support

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router
- TailwindCSS
- Framer Motion
- Zustand (State Management)
- React Query
- Socket.io Client

### Backend
- Node.js
- Express
- Supabase (Database, Auth, Storage)
- Socket.io (Real-time)
- Stripe, PayPal, M-Pesa integrations

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Shoe
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables:

**Frontend** (`frontend/.env`):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
STRIPE_SECRET_KEY=your_stripe_secret_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000
```

4. Set up Supabase database (see `backend/database/schema.sql`)

5. Run the development servers:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`
Backend will run on `http://localhost:5000`

## 📁 Project Structure

```
Shoe/
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # State management
│   │   ├── lib/            # Utilities and configs
│   │   ├── hooks/          # Custom React hooks
│   │   └── services/       # API services
│   ├── public/
│   └── package.json
├── backend/
│   ├── routes/             # API routes
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── services/           # Business logic
│   ├── config/             # Configuration files
│   └── database/           # Database schemas and migrations
└── package.json
```

## 🎨 Design System

### Colors
- **Primary Orange**: `#FF6B35` (buttons, CTAs, accents)
- **Secondary Green**: `#4CAF50` (filters, icons, badges)
- **Background**: White for clean, modern aesthetic

### Typography
- Font Family: Inter
- Responsive design with mobile-first approach

## 📝 License

MIT
# Shoe-shop
