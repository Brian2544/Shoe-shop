import express from 'express'
import { supabase } from '../config/supabase.js'

// Note: io should be passed from server.js or imported differently
// For now, we'll handle this in the route handler
let ioInstance = null

export const setIO = (io) => {
  ioInstance = io
}

const getIO = () => {
  if (!ioInstance) {
    console.warn('Socket.io instance not initialized')
  }
  return ioInstance
}

const router = express.Router()

// Create new order
router.post('/', async (req, res) => {
  try {
    const { items, shipping, payment, total, subtotal, tax, shippingCost } = req.body

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: req.user?.id || null,
        items: items,
        shipping_info: shipping,
        payment_method: payment.method,
        status: 'pending',
        total,
        subtotal,
        tax,
        shipping_cost: shippingCost || 0,
        currency_code: 'KES',
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Update product stock
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.id)
        .single()
      
      if (product) {
        await supabase
          .from('products')
          .update({ stock_quantity: Math.max(0, product.stock_quantity - item.quantity) })
          .eq('id', item.id)
      }
    }

    // Emit real-time update
    const io = getIO()
    if (io) io.emit('order-created', order)

    res.json({ success: true, orderId: order.id, data: order })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get user orders
router.get('/user/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', req.params.userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ success: true, data: data || [] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get single order
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error) throw error

    if (!data) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }

    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, tracking_number } = req.body

    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        tracking_number,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error

    // Emit real-time update
    const io = getIO()
    if (io) io.emit('order-update', data)

    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
