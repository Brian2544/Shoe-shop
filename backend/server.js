// Load environment variables FIRST before any other imports
import 'dotenv/config'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { supabase } from './config/supabase.js'
import { seedAdminUsers } from './scripts/seed_admin.js'

// Import routes
import productRoutes from './routes/products.js'
import userRoutes from './routes/users.js'
import orderRoutes, { setIO } from './routes/orders.js'
import paymentRoutes from './routes/payments.js'
import reviewRoutes from './routes/reviews.js'
import marketingRoutes from './routes/marketing.js'
import adminRoutes from './routes/admin.js'
import uploadRoutes from './routes/uploads.js'
import testRoutes from './routes/test.js'
import { getCloudinaryConfig } from './config/cloudinary.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '.env') })
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })

const app = express()
const httpServer = createServer(app)

// Get CORS origin from env or use default
// In development, allow localhost:3000 (frontend) and * for flexibility
const corsOrigin = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? false : 'http://localhost:3000')
const isProduction = process.env.NODE_ENV === 'production'

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
  },
})

// Set io instance for orders route (must be after io is created)
setIO(io)

const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: corsOrigin || (isProduction ? false : true), // Allow all origins in dev, specific in prod
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/products', productRoutes)
app.use('/api/users', userRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/marketing', marketingRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/test', testRoutes) // Test routes for debugging

// Health check (no secrets exposed)
app.get('/api/health', (req, res) => {
  const healthStatus = {
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    supabaseConfigured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
  }
  console.log('💚 Health check:', healthStatus)
  res.json(healthStatus)
})

// Basic health check alias
app.get('/health', (req, res) => {
  res.json({ ok: true })
})

// Config status (dev only, no secrets exposed)
app.get('/api/config-status', (req, res) => {
  // Only expose in development
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ message: 'Not found' })
  }

  const supabaseUrl = process.env.SUPABASE_URL || ''
  let supabaseUrlHost = ''
  if (supabaseUrl) {
    try {
      const url = new URL(supabaseUrl)
      supabaseUrlHost = url.hostname
    } catch (e) {
      supabaseUrlHost = 'Invalid URL'
    }
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').filter(e => e.trim()).length

  const configStatus = {
    supabaseUrlHost,
    supabaseConfigured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    adminEmailsCount: adminEmails,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  }
  
  console.log('🔧 Config status (dev only):', {
    ...configStatus,
    // Never log actual values
  })
  
  res.json(configStatus)
})

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  // Subscribe to stock updates
  socket.on('subscribe-stock', async (productId) => {
    const channel = supabase
      .channel(`stock-${productId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${productId}`,
        },
        (payload) => {
          socket.emit('stock-update', payload.new)
        }
      )
      .subscribe()
  })

  // Subscribe to order updates
  socket.on('subscribe-order', async (orderId) => {
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          socket.emit('order-update', payload.new)
        }
      )
      .subscribe()
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Enhanced startup logging
httpServer.listen(PORT, () => {
  const cloudinaryConfig = getCloudinaryConfig()
  console.log(`☁️ Cloudinary configured: ${cloudinaryConfig.isConfigured ? 'true' : 'false'}`)

  seedAdminUsers()
    .then(() => console.log('✅ Admin seed check complete'))
    .catch((error) => console.warn('Admin seed skipped:', error.message))

  if (!isProduction) {
    console.log('='.repeat(50))
    console.log('✅ Backend Server Started Successfully')
    console.log('='.repeat(50))
    console.log(`📍 Port: ${PORT}`)
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🔗 CORS origin: ${corsOrigin || 'All origins (dev mode)'}`)
    console.log(`📡 Health endpoint: http://localhost:${PORT}/api/health`)
    console.log(`📦 Products endpoint: http://localhost:${PORT}/api/products`)
    
    // Log environment variable status (names only, never values)
    const envStatus = {
      SUPABASE_URL: process.env.SUPABASE_URL ? '✓ Set' : '✗ Missing',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '✗ Missing',
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? '✓ Set' : '○ Optional (not set)',
    }
    console.log('\n📋 Environment Variables Status:')
    Object.entries(envStatus).forEach(([key, status]) => {
      console.log(`   ${key}: ${status}`)
    })
    console.log('='.repeat(50))
  } else {
    // Minimal logging in production
    console.log(`Server running on port ${PORT}`)
  }
})

export { io, httpServer }
