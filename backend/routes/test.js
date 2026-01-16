/**
 * Test Route - For debugging and verification
 * Returns sample data to verify frontend-backend connectivity
 */

import express from 'express'

const router = express.Router()

// Simple test endpoint
router.get('/ping', (req, res) => {
  console.log('🏓 Ping received from:', req.ip)
  res.json({ 
    ok: true, 
    message: 'Backend is responding',
    timestamp: new Date().toISOString(),
  })
})

// Test data endpoint
router.get('/sample-products', (req, res) => {
  console.log('📦 Sample products requested')
  const sampleProducts = [
    {
      id: 'test-1',
      name: 'Test Product 1',
      brand: 'Test Brand',
      price: 99.99,
      image: '/placeholder-shoe.jpg',
      featured: true,
    },
    {
      id: 'test-2',
      name: 'Test Product 2',
      brand: 'Test Brand',
      price: 149.99,
      image: '/placeholder-shoe.jpg',
      featured: true,
    },
  ]
  
  res.json({
    success: true,
    data: sampleProducts,
    message: 'This is sample data for testing',
  })
})

export default router
